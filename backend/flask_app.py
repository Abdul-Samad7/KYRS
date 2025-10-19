from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import sys
import os

# Load environment variables
load_dotenv()

# Add parent directory to path so we can import from backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.data_loader import load_data, get_numeric_columns, get_categorical_columns
from backend.gemini_agent import ask_gemini
from backend.retriever import filter_dataframe
import pandas as pd
import numpy as np

app = Flask(__name__)

# Enable CORS for React frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Load data on startup
df = None

def init_data():
    """Initialize the dataset on startup"""
    global df
    df = load_data()
    if df is not None:
        print(f"✅ Loaded {len(df)} exoplanets")
        print(f"📊 Columns: {', '.join(df.columns[:10])}...")
    else:
        print("❌ Failed to load data")

init_data()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'data_loaded': df is not None,
        'total_records': len(df) if df is not None else 0,
        'columns': list(df.columns) if df is not None else []
    })


@app.route('/api/exoplanets', methods=['GET'])
def get_exoplanets():
    """Get all exoplanets with optional filtering and exploration"""
    if df is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    # Get query parameters
    limit = request.args.get('limit', default=50, type=int)
    offset = request.args.get('offset', default=0, type=int)
    disposition = request.args.get('disposition', type=str)
    
    # Temperature filters
    min_temp = request.args.get('min_temp', type=float)
    max_temp = request.args.get('max_temp', type=float)
    
    # Radius filters
    min_radius = request.args.get('min_radius', type=float)
    max_radius = request.args.get('max_radius', type=float)
    
    # Period filters
    min_period = request.args.get('min_period', type=float)
    max_period = request.args.get('max_period', type=float)
    
    filtered_df = df.copy()
    
    # Apply disposition filter
    if disposition:
        disp_cols = ['koi_disposition', 'disposition_using_kepler_data', 'disposition']
        for disp_col in disp_cols:
            if disp_col in filtered_df.columns:
                filtered_df = filtered_df[
                    filtered_df[disp_col].str.contains(disposition, case=False, na=False)
                ]
                break
    
    # Apply temperature filters
    temp_cols = ['koi_teq', 'equilibrium_temperature_kelvin', 'temperature']
    temp_col = next((col for col in temp_cols if col in filtered_df.columns), None)
    if temp_col:
        if min_temp is not None:
            filtered_df = filtered_df[filtered_df[temp_col] >= min_temp]
        if max_temp is not None:
            filtered_df = filtered_df[filtered_df[temp_col] <= max_temp]
    
    # Apply radius filters
    radius_cols = ['koi_prad', 'planet_radius_earth_radii', 'radius']
    radius_col = next((col for col in radius_cols if col in filtered_df.columns), None)
    if radius_col:
        if min_radius is not None:
            filtered_df = filtered_df[filtered_df[radius_col] >= min_radius]
        if max_radius is not None:
            filtered_df = filtered_df[filtered_df[radius_col] <= max_radius]
    
    # Apply period filters
    period_cols = ['koi_period', 'orbital_period_days', 'period']
    period_col = next((col for col in period_cols if col in filtered_df.columns), None)
    if period_col:
        if min_period is not None:
            filtered_df = filtered_df[filtered_df[period_col] >= min_period]
        if max_period is not None:
            filtered_df = filtered_df[filtered_df[period_col] <= max_period]
    
    # Sort options
    sort_by = request.args.get('sort_by', type=str)
    sort_order = request.args.get('sort_order', default='asc', type=str)
    if sort_by and sort_by in filtered_df.columns:
        filtered_df = filtered_df.sort_values(
            by=sort_by, 
            ascending=(sort_order == 'asc')
        )
    
    # Pagination
    total = len(filtered_df)
    result_df = filtered_df.iloc[offset:offset + limit]
    
    # Convert to list of dicts, handling NaN values
    exoplanets = result_df.replace({np.nan: None}).to_dict('records')
    
    return jsonify({
        'total': total,
        'offset': offset,
        'limit': limit,
        'filters_applied': {
            'disposition': disposition,
            'temperature_range': [min_temp, max_temp] if min_temp or max_temp else None,
            'radius_range': [min_radius, max_radius] if min_radius or max_radius else None,
            'period_range': [min_period, max_period] if min_period or max_period else None,
        },
        'data': exoplanets
    })

@app.route('/api/exoplanets/<planet_id>', methods=['GET'])
def get_exoplanet_by_id(planet_id):
    """Get a specific exoplanet by ID with full details"""
    if df is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    result = None
    
    # Try to find by kepler_id (numeric)
    if 'kepler_id' in df.columns:
        try:
            planet_id_int = int(planet_id)
            result = df[df['kepler_id'] == planet_id_int]
        except ValueError:
            pass
    
    # Try koi_name if kepler_id didn't work
    if result is None or result.empty:
        if 'koi_name' in df.columns:
            result = df[df['koi_name'].str.contains(str(planet_id), case=False, na=False)]
    
    # Try planet_name
    if result is None or result.empty:
        if 'planet_name' in df.columns:
            result = df[df['planet_name'].str.contains(str(planet_id), case=False, na=False)]
    
    if result is None or result.empty:
        return jsonify({'error': f'Planet with ID {planet_id} not found'}), 404
    
    # Return first match with all data
    planet_data = result.iloc[0].replace({np.nan: None}).to_dict()
    
    return jsonify(planet_data)


@app.route('/api/search', methods=['GET'])
def search_exoplanets():
    """Search exoplanets by name or ID"""
    if df is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'error': 'Query parameter "q" is required'}), 400
    
    # Search in name columns
    mask = pd.Series(False, index=df.index)
    
    name_columns = ['kepoi_name', 'kepler_name', 'kepid']
    for col in name_columns:
        if col in df.columns:
            if col == 'kepid':
                try:
                    query_int = int(query)
                    mask |= (df[col] == query_int)
                except ValueError:
                    pass
            else:
                mask |= df[col].astype(str).str.contains(query, case=False, na=False)
    
    results = df[mask]
    
    return jsonify({
        'query': query,
        'total': len(results),
        'data': results.head(50).replace({np.nan: None}).to_dict('records')
    })


@app.route('/api/ask', methods=['POST'])
def ask_question():
    """Ask Gemini AI a question about the exoplanet data"""
    if df is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    data = request.get_json()
    question = data.get('question', '').strip()
    style = data.get('style', 'brief')
    
    if not question:
        return jsonify({'error': 'Question is required'}), 400
    
    try:
        # Use smart filtering to get relevant data
        filtered_df = filter_dataframe(df, question)
        
        print(f"💬 Question: {question}")
        print(f"📊 Analyzing {len(filtered_df)} records")
        
        # Get answer from Gemini
        answer = ask_gemini(question, filtered_df, style)
        
        return jsonify({
            'question': question,
            'answer': answer,
            'records_analyzed': len(filtered_df),
            'total_records': len(df)
        })
    
    except Exception as e:
        print(f"❌ Error in ask endpoint: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/compare', methods=['POST'])
def compare_planets():
    """Compare multiple planets side-by-side"""
    if df is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    data = request.get_json()
    planet_ids = data.get('planet_ids', [])
    
    if not planet_ids or len(planet_ids) < 2:
        return jsonify({'error': 'At least 2 planet IDs required for comparison'}), 400
    
    planets = []
    for pid in planet_ids:
        result = None
        
        # Try to find planet
        if 'kepid' in df.columns:
            try:
                pid_int = int(pid)
                result = df[df['kepid'] == pid_int]
            except ValueError:
                pass
        
        if result is None or result.empty:
            if 'kepoi_name' in df.columns:
                result = df[df['kepoi_name'].str.contains(str(pid), case=False, na=False)]
        
        if result is None or result.empty:
            if 'kepler_name' in df.columns:
                result = df[df['kepler_name'].str.contains(str(pid), case=False, na=False)]
        
        if result is not None and not result.empty:
            planets.append(result.iloc[0].replace({np.nan: None}).to_dict())
    
    if len(planets) < 2:
        return jsonify({'error': 'Could not find enough planets to compare'}), 404
    
    # Generate comparison insights
    comparison_fields = ['koi_teq', 'koi_prad', 'koi_period', 'koi_insol', 
                        'equilibrium_temperature_kelvin', 'planet_radius_earth_radii', 
                        'orbital_period_days']
    
    comparison_data = {}
    for field in comparison_fields:
        if field in planets[0]:
            values = [p.get(field) for p in planets if p.get(field) is not None]
            if values:
                comparison_data[field] = {
                    'min': min(values),
                    'max': max(values),
                    'avg': sum(values) / len(values),
                    'values': values
                }
    
    return jsonify({
        'planets': planets,
        'count': len(planets),
        'comparison': comparison_data
    })


@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """Get comprehensive dataset statistics and exploration data"""
    if df is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    stats = {
        'total_records': len(df),
        'total_columns': len(df.columns),
        'columns': list(df.columns),
        'numeric_columns': get_numeric_columns(df),
        'categorical_columns': get_categorical_columns(df)[:20],
    }
    
    # Disposition breakdown
    disp_cols = ['koi_disposition', 'disposition_using_kepler_data', 'disposition']
    for disp_col in disp_cols:
        if disp_col in df.columns:
            stats['disposition_counts'] = df[disp_col].value_counts().to_dict()
            break
    
    # Numeric statistics for key columns
    numeric_stats = {}
    key_cols_mapping = {
        'temperature': ['koi_teq', 'equilibrium_temperature_kelvin', 'temp'],
        'radius': ['koi_prad', 'planet_radius_earth_radii', 'radius'],
        'period': ['koi_period', 'orbital_period_days', 'period'],
        'insolation': ['koi_insol', 'stellar_flux']
    }
    
    for stat_name, possible_cols in key_cols_mapping.items():
        for col in possible_cols:
            if col in df.columns:
                numeric_stats[stat_name] = {
                    'column': col,
                    'min': float(df[col].min()),
                    'max': float(df[col].max()),
                    'mean': float(df[col].mean()),
                    'median': float(df[col].median()),
                    'std': float(df[col].std())
                }
                break
    
    stats['numeric_stats'] = numeric_stats
    
    # Data quality
    stats['data_quality'] = {
        'completeness': {
            col: f"{(df[col].notna().sum() / len(df) * 100):.1f}%"
            for col in df.columns[:10]
        }
    }
    
    return jsonify(stats)


@app.route('/api/explore/distributions', methods=['GET'])
def get_distributions():
    """Get distribution data for visualizations"""
    if df is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    column = request.args.get('column')
    bins = request.args.get('bins', default=20, type=int)
    
    if not column or column not in df.columns:
        return jsonify({'error': 'Valid column parameter required'}), 400
    
    if pd.api.types.is_numeric_dtype(df[column]):
        # Create histogram data
        hist, bin_edges = np.histogram(df[column].dropna(), bins=bins)
        
        return jsonify({
            'column': column,
            'type': 'numeric',
            'histogram': {
                'counts': hist.tolist(),
                'bin_edges': bin_edges.tolist()
            },
            'stats': {
                'min': float(df[column].min()),
                'max': float(df[column].max()),
                'mean': float(df[column].mean()),
                'median': float(df[column].median())
            }
        })
    else:
        # Get value counts for categorical
        value_counts = df[column].value_counts().head(20)
        
        return jsonify({
            'column': column,
            'type': 'categorical',
            'value_counts': value_counts.to_dict(),
            'unique_count': int(df[column].nunique())
        })


if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 ExoExplorer API Server")
    print("="*50)
    print(f"📍 Running on: http://localhost:5001")
    print(f"📊 Loaded {len(df) if df is not None else 0} exoplanets")
    print(f"🔬 Features: Ask Gemini, Filtering, Comparison, Exploration")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)