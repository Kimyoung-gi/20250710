from flask import Flask, render_template, request, jsonify
import csv
import os
from datetime import datetime

app = Flask(__name__)

# CSV 파일에서 데이터 로드
def load_jobs_from_csv():
    """CSV 파일에서 채용 데이터 로드"""
    jobs = []
    csv_files = [f for f in os.listdir('.') if f.startswith('SARAMIN_') and f.endswith('.csv')]
    
    if not csv_files:
        return []
    
    # 가장 최근 CSV 파일 사용
    latest_csv = max(csv_files)
    print(f"CSV 파일 '{latest_csv}'에서 데이터를 로드합니다.")
    
    try:
        with open(latest_csv, 'r', encoding='utf-8-sig') as file:
            reader = csv.DictReader(file)
            for row in reader:
                jobs.append({
                    'company': row['회사명'],
                    'title': row['직무'],
                    'schedule': row['일정'],
                    'reg_date': row['등록일/수정일'],
                    'address': row['주소']
                })
        print(f"총 {len(jobs)}개의 데이터를 로드했습니다.")
        return jobs
    except Exception as e:
        print(f"CSV 파일 로드 중 오류: {e}")
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/jobs')
def get_jobs():
    """채용 데이터 API"""
    jobs = load_jobs_from_csv()
    return jsonify(jobs)

@app.route('/api/search', methods=['POST'])
def search_jobs():
    """지역별 검색 API (주소 기반)"""
    data = request.get_json()
    location = data.get('location', '').strip()
    
    jobs = load_jobs_from_csv()
    
    if location:
        # 주소에서 검색어 포함된 데이터 필터링
        filtered_jobs = []
        for job in jobs:
            if location in job['address']:
                filtered_jobs.append(job)
        jobs = filtered_jobs
    
    return jsonify(jobs)

@app.route('/api/stats')
def get_stats():
    """통계 데이터 API"""
    jobs = load_jobs_from_csv()
    
    if not jobs:
        return jsonify({
            'total_jobs': 0,
            'companies': {},
            'locations': {}
        })
    
    # 회사별 통계
    companies = {}
    for job in jobs:
        company = job['company']
        if company in companies:
            companies[company] += 1
        else:
            companies[company] = 1
    
    # 지역별 통계 (주소 기반)
    locations = {}
    for job in jobs:
        address = job['address']
        # 주소에서 첫 번째 지역명 추출
        if '서울' in address:
            location = '서울'
        elif '경기' in address:
            location = '경기'
        elif '인천' in address:
            location = '인천'
        elif '부산' in address:
            location = '부산'
        elif '대구' in address:
            location = '대구'
        elif '광주' in address:
            location = '광주'
        elif '대전' in address:
            location = '대전'
        elif '울산' in address:
            location = '울산'
        elif '세종' in address:
            location = '세종'
        elif '강원' in address:
            location = '강원'
        elif '충북' in address or '충남' in address:
            location = '충청'
        elif '전북' in address or '전남' in address:
            location = '전라'
        elif '경북' in address or '경남' in address:
            location = '경상'
        elif '제주' in address:
            location = '제주'
        else:
            location = '기타'
        
        if location in locations:
            locations[location] += 1
        else:
            locations[location] = 1
    
    return jsonify({
        'total_jobs': len(jobs),
        'companies': companies,
        'locations': locations
    })

@app.route('/api/test')
def test():
    """테스트 API"""
    return jsonify({'status': 'success', 'message': 'Flask 앱이 정상적으로 작동하고 있습니다.'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 