from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
import csv
import os
from datetime import datetime
import hashlib

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # 세션을 위한 시크릿 키
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB 파일 크기 제한

# 관리자 비밀번호 (0070)
ADMIN_PASSWORD = "0070"

# CSV 파일에서 데이터 로드
def load_jobs_from_csv():
    """CSV 파일에서 채용 데이터 로드"""
    jobs = []
    csv_files = [f for f in os.listdir('.') if f.startswith('SARAMIN_') and f.endswith('.csv')]
    
    if not csv_files:
        return []
    
    # 가장 최근 CSV 파일 사용 (업로드된 파일 우선)
    uploaded_files = [f for f in csv_files if 'uploaded' in f]
    if uploaded_files:
        latest_csv = max(uploaded_files)
    else:
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

@app.route('/admin')
def admin_login():
    return render_template('admin_login.html')

@app.route('/admin/login', methods=['POST'])
def admin_login_post():
    password = request.form.get('password')
    if password == ADMIN_PASSWORD:
        return redirect(url_for('admin_dashboard'))
    else:
        flash('비밀번호가 올바르지 않습니다.')
        return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
def admin_dashboard():
    return render_template('admin_dashboard.html')

@app.route('/admin/upload', methods=['POST'])
def upload_csv():
    print("=== 파일 업로드 시작 ===")
    print(f"Request method: {request.method}")
    print(f"Request files: {request.files}")
    print(f"Request form: {request.form}")
    
    if 'file' not in request.files:
        print("파일이 request.files에 없습니다.")
        print(f"Available files: {list(request.files.keys())}")
        flash('파일이 선택되지 않았습니다.')
        return redirect(url_for('admin_dashboard'))
    
    file = request.files['file']
    print(f"파일명: {file.filename}")
    print(f"파일 타입: {file.content_type}")
    print(f"파일 크기: {file.content_length if hasattr(file, 'content_length') else 'N/A'}")
    
    if file.filename == '':
        print("파일명이 비어있습니다.")
        flash('파일이 선택되지 않았습니다.')
        return redirect(url_for('admin_dashboard'))
    
    if file and file.filename.endswith('.csv'):
        try:
            # 현재 시간으로 파일명 생성
            now = datetime.now()
            filename = f"SARAMIN_{now.strftime('%m%d')}({now.strftime('%H%M')})_uploaded.csv"
            print(f"저장할 파일명: {filename}")
            
            # 파일 저장
            file.save(filename)
            print(f"파일 저장 완료: {filename}")
            
            # 파일 존재 확인
            if os.path.exists(filename):
                print(f"파일이 성공적으로 저장되었습니다: {filename}")
            else:
                print("파일 저장에 실패했습니다.")
                flash('파일 저장에 실패했습니다.')
                return redirect(url_for('admin_dashboard'))
            
            # CSV 파일 검증
            with open(filename, 'r', encoding='utf-8-sig') as csvfile:
                reader = csv.DictReader(csvfile)
                headers = reader.fieldnames
                print(f"CSV 헤더: {headers}")
                
                # 필수 컬럼 확인
                required_columns = ['회사명', '직무', '일정', '등록일/수정일', '주소']
                missing_columns = [col for col in required_columns if col not in headers]
                
                if missing_columns:
                    print(f"누락된 컬럼: {missing_columns}")
                    os.remove(filename)  # 잘못된 파일 삭제
                    flash(f'필수 컬럼이 누락되었습니다: {", ".join(missing_columns)}')
                    return redirect(url_for('admin_dashboard'))
                
                # 데이터 개수 확인
                data_count = sum(1 for row in reader)
                print(f"데이터 개수: {data_count}")
                flash(f'파일 업로드 성공! {data_count}개의 채용정보가 등록되었습니다.')
                
        except Exception as e:
            print(f"파일 업로드 중 오류: {str(e)}")
            import traceback
            traceback.print_exc()
            flash(f'파일 업로드 중 오류가 발생했습니다: {str(e)}')
            return redirect(url_for('admin_dashboard'))
    else:
        print(f"파일이 CSV가 아닙니다: {file.filename}")
        flash('CSV 파일만 업로드 가능합니다.')
        return redirect(url_for('admin_dashboard'))
    
    print("=== 파일 업로드 완료 ===")
    return redirect(url_for('admin_dashboard'))

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
