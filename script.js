// CSV 데이터 로더 및 검색 기능
class JobDataLoader {
    constructor() {
        this.jobsData = [];
        this.filteredData = [];
        this.currentCsvFile = null;
    }

    // 로컬 API에서 데이터를 가져오는 함수
    async loadJobsData() {
        try {
            const response = await fetch('/api/jobs');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const jobs = await response.json();
            this.jobsData = jobs;
            console.log(`${this.jobsData.length}개의 채용정보를 로드했습니다.`);
            
            return this.jobsData;
        } catch (error) {
            console.error('채용 데이터를 로드하는데 실패했습니다:', error);
            return [];
        }
    }

    // CSV 라인 파싱 (쉼표가 포함된 필드 처리)
    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    // 지역별 검색 함수
    async searchByLocation(location) {
        try {
            if (!location || location.trim() === '') {
                // 전체 데이터 로드
                await this.loadJobsData();
                this.filteredData = [...this.jobsData];
            } else {
                // 검색 API 호출
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ location: location.trim() })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                this.filteredData = await response.json();
            }
            
            return this.filteredData;
        } catch (error) {
            console.error('검색 중 오류 발생:', error);
            return [];
        }
    }

    // 검색 결과를 HTML로 렌더링
    renderSearchResults(container) {
        if (this.filteredData.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle me-2"></i>
                    검색 결과가 없습니다. 다른 지역으로 검색해보세요.
                </div>
            `;
            return;
        }

        const resultsHtml = this.filteredData.map((job, index) => `
            <div class="job-card card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5 class="company-name mb-2">${this.escapeHtml(job['company'] || '정보없음')}</h5>
                            <p class="job-title mb-2"><strong>${this.escapeHtml(job['title'] || '정보없음')}</strong></p>
                            <div class="job-details">
                                <div class="mb-2">
                                    <span class="badge bg-primary me-2" style="background-color: #0055aa !important; color: white;">
                                        일정: ${this.escapeHtml(job['schedule'] || '정보없음')}
                                    </span>
                                </div>
                                <div class="mb-2">
                                    <span class="badge bg-dark me-2" style="background-color: #000000 !important; color: white;">
                                        등록일/수정일: ${this.escapeHtml(job['reg_date'] || '정보없음')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="address-info">
                                <i class="fas fa-map-marker-alt me-1"></i>
                                ${this.escapeHtml(job['address'] || '정보없음')}
                            </div>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12 text-end">
                            <button class="btn btn-outline-primary btn-sm" onclick="copyJobInfo(${index})">
                                <i class="fas fa-copy me-1"></i>복사하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = resultsHtml;
    }

    // HTML 이스케이프 함수
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 데이터 로드 상태 업데이트
    updateLoadingStatus(status, message = '') {
        const statusElement = document.getElementById('loadingStatus');
        if (statusElement) {
            if (status === 'loading') {
                statusElement.innerHTML = `
                    <div class="text-center">
                        <div class="loading-spinner mx-auto mb-2"></div>
                        <p class="text-muted">${message}</p>
                    </div>
                `;
            } else if (status === 'error') {
                statusElement.innerHTML = `
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle text-warning fa-2x mb-2"></i>
                        <p class="text-muted">${message}</p>
                    </div>
                `;
            } else {
                // 로딩 완료 시 상태 제거
                statusElement.innerHTML = '';
            }
        }
    }
}

// 전역 인스턴스 생성
const jobDataLoader = new JobDataLoader();

// 페이지 로드 시 데이터 초기화
document.addEventListener('DOMContentLoaded', async function() {
    console.log('페이지 로드됨, 데이터 초기화 중...');
    
    // 로딩 상태 표시
    jobDataLoader.updateLoadingStatus('loading', '오픈 정보를 검색하고 있습니다...');
    
    try {
        // 로컬 API에서 데이터 로드
        const jobs = await jobDataLoader.loadJobsData();
        
        if (jobs.length > 0) {
            // 초기 데이터 표시
            jobDataLoader.filteredData = [...jobDataLoader.jobsData];
            const resultsContainer = document.getElementById('searchResults');
            if (resultsContainer) {
                jobDataLoader.renderSearchResults(resultsContainer);
            }
            
            // 결과 개수 업데이트
            updateResultCount(jobDataLoader.filteredData.length);
            
            // 로딩 상태 제거
            jobDataLoader.updateLoadingStatus('complete');
            
            console.log('데이터 로드 완료');
        } else {
            console.log('채용 데이터가 없습니다.');
            jobDataLoader.updateLoadingStatus('error', '데이터를 불러올 수 없습니다.');
        }
    } catch (error) {
        console.error('데이터 초기화 실패:', error);
        jobDataLoader.updateLoadingStatus('error', '데이터 로드에 실패했습니다.');
    }
});

// 검색 기능
async function performSearch() {
    const locationInput = document.getElementById('location');
    const searchTerm = locationInput ? locationInput.value : '';
    
    // 검색 실행
    const results = await jobDataLoader.searchByLocation(searchTerm);
    
    // 결과 표시
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        jobDataLoader.renderSearchResults(resultsContainer);
    }
    
    // 결과 개수 업데이트
    updateResultCount(results.length);
}

// 결과 개수 업데이트
function updateResultCount(count) {
    const countElement = document.getElementById('resultCount');
    if (countElement) {
        countElement.textContent = `총 ${count}개의 오픈 정보를 찾았습니다`;
    }
}

// 게시물 정보 복사하기 함수
function copyJobInfo(index) {
    const job = jobDataLoader.filteredData[index];
    if (!job) return;
    
    const jobInfo = `회사명: ${job['company'] || '정보없음'}
직무: ${job['title'] || '정보없음'}
일정: ${job['schedule'] || '정보없음'}
등록일/수정일: ${job['reg_date'] || '정보없음'}
기업위치: ${job['address'] || '정보없음'}`;
    
    // 클립보드에 복사
    navigator.clipboard.writeText(jobInfo).then(() => {
        // 복사 성공 알림
        showCopyNotification();
    }).catch(err => {
        console.error('클립보드 복사 실패:', err);
        // 대체 방법: 텍스트 영역을 통한 복사
        fallbackCopy(jobInfo);
    });
}

// 복사 성공 알림 표시
function showCopyNotification() {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = 'copy-notification alert alert-success position-fixed';
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 200px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        게시물 정보가 클립보드에 복사되었습니다!
    `;
    
    document.body.appendChild(notification);
    
    // 3초 후 알림 제거
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// 대체 복사 방법 (구형 브라우저 지원)
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyNotification();
    } catch (err) {
        console.error('대체 복사 방법도 실패:', err);
    }
    
    document.body.removeChild(textArea);
}

// 검색 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // 엔터키 검색
    const locationInput = document.getElementById('location');
    if (locationInput) {
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}); 
