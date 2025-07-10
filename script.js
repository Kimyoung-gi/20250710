document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const locationInput = document.getElementById('location');
    const loading = document.getElementById('loading');
    const resultsSection = document.getElementById('resultsSection');
    const jobsContainer = document.getElementById('jobsContainer');
    const resultCount = document.getElementById('resultCount');
    const errorSection = document.getElementById('errorSection');
    const errorText = document.getElementById('errorText');
    const noResults = document.getElementById('noResults');

    // 페이지 로드 시 모든 데이터 로드
    loadAllJobs();

    // 검색 버튼 클릭 이벤트
    searchBtn.addEventListener('click', performSearch);
    
    // Enter 키 이벤트
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });

    function loadAllJobs() {
        // UI 초기화
        hideAllSections();
        showLoading();
        
        // 모든 데이터 로드
        fetch('/api/jobs')
            .then(response => response.json())
            .then(jobs => {
                hideLoading();
                if (jobs && jobs.length > 0) {
                    displayResults(jobs);
                } else {
                    showNoResults();
                }
            })
            .catch(error => {
                hideLoading();
                showError('데이터 로드 중 오류가 발생했습니다.');
                console.error('Error:', error);
            });
    }

    function performSearch() {
        const location = locationInput.value.trim();
        
        // UI 초기화
        hideAllSections();
        showLoading();
        
        // 검색 API 호출
        fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                location: location
            })
        })
        .then(response => response.json())
        .then(jobs => {
            hideLoading();
            
            if (jobs && jobs.length > 0) {
                displayResults(jobs);
            } else {
                showNoResults();
            }
        })
        .catch(error => {
            hideLoading();
            showError('검색 중 오류가 발생했습니다.');
            console.error('Error:', error);
        });
    }

    function displayResults(jobs) {
        resultCount.textContent = jobs.length;
        
        jobsContainer.innerHTML = '';
        
        jobs.forEach((job, index) => {
            const jobCard = createJobCard(job, index);
            jobsContainer.appendChild(jobCard);
        });
        
        resultsSection.style.display = 'block';
    }

    function createJobCard(job, index) {
        const card = document.createElement('div');
        card.className = 'job-card mb-4 p-4';
        
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="company-name">
                    <i class="fas fa-building me-2"></i>
                    ${job.company || '회사명 없음'}
                </div>
                <span class="info-badge">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    ${index + 1}번째
                </span>
            </div>
            
            <div class="job-title">
                <i class="fas fa-briefcase me-2"></i>
                ${job.title || '제목 없음'}
            </div>
            
            <div class="row mt-3">
                <div class="col-md-6">
                    <div class="job-info">
                        <i class="fas fa-calendar-alt me-2"></i>
                        <strong>공고일정:</strong> ${job.schedule || '정보 없음'}
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="job-info">
                        <i class="fas fa-clock me-2"></i>
                        <strong>등록일/수정일:</strong> ${job.reg_date || '정보 없음'}
                    </div>
                </div>
            </div>
            
            <div class="row mt-2">
                <div class="col-12">
                    <div class="address-info">
                        <i class="fas fa-map-pin me-2"></i>
                        <strong>주소:</strong> ${job.address || '주소 정보 없음'}
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }

    function showLoading() {
        loading.style.display = 'block';
    }

    function hideLoading() {
        loading.style.display = 'none';
    }

    function showError(message) {
        errorText.textContent = message;
        errorSection.style.display = 'block';
    }

    function showNoResults() {
        noResults.style.display = 'block';
    }

    function hideAllSections() {
        loading.style.display = 'none';
        resultsSection.style.display = 'none';
        errorSection.style.display = 'none';
        noResults.style.display = 'none';
    }

    // 페이지 로드 시 테스트 API 호출
    fetch('/api/test')
        .then(response => response.json())
        .then(data => {
            console.log('API 연결 확인:', data);
        })
        .catch(error => {
            console.error('API 연결 오류:', error);
        });
}); 