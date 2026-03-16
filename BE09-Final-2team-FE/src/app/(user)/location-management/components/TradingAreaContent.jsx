"use client";

import React, { useState, useRef, useEffect } from 'react';
import '../location-management.css';
import ConfirmModal, {MODAL_TYPES} from "@/components/common/ConfirmModal";
import { userAPI } from "@/lib/api";
import { useUser } from "@/store/userStore";
import { useGetMypageDashboard } from "@/store/mypageStore";

const TradingAreaContent = () => {
    const user = useUser();
    const getMypageDashboard = useGetMypageDashboard();

    const [selectedAreas, setSelectedAreas] = useState([]);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showLimitAlert, setShowLimitAlert] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [searchResults, setSearchResults] = useState([]); // API 검색 결과
    const [isSearching, setIsSearching] = useState(false);  // 검색 중 로딩

    const initialAreas = useRef([]);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const dropdownItemRefs = useRef([]);

    // 마운트 시 기존 거래지역 불러오기
    useEffect(() => {
        const loadTradeLocations = async () => {
            if (!user?.id) return;
            try {
                const response = await userAPI.getMyTradeLocations(user.id);
                const locations = response.data.data;
                // API 응답: [{ id, emd, ... }] 형태
                const areaList = locations.map(loc => ({ id: loc.id, name: loc.emd }));
                setSelectedAreas(areaList);
                initialAreas.current = [...areaList];
            } catch (error) {
                console.error("거래지역 불러오기 실패:", error);
            }
        };
        void loadTradeLocations();
    }, [user?.id]);

    // 검색어 변경 시 API 호출
    useEffect(() => {
        if (!searchKeyword.trim()) {
            setSearchResults([]);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await userAPI.searchTradeLocations(searchKeyword);
                setSearchResults(response.data.data || []);
            } catch (error) {
                console.error("지역 검색 실패:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms 디바운스

        return () => clearTimeout(debounceTimer);
    }, [searchKeyword]);

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isDropdownOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target)
            ) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // 드롭다운이 열릴 때마다 포커스 인덱스 초기화
    useEffect(() => {
        if (isDropdownOpen) {
            setFocusedIndex(-1);
        }
    }, [isDropdownOpen]);

    // 포커스된 항목을 화면에 보이도록 스크롤 처리
    useEffect(() => {
        if (focusedIndex >= 0 && dropdownItemRefs.current[focusedIndex]) {
            const focusedElement = dropdownItemRefs.current[focusedIndex];
            const dropdown = dropdownRef.current;

            if (dropdown && focusedElement) {
                const dropdownRect = dropdown.getBoundingClientRect();
                const elementRect = focusedElement.getBoundingClientRect();

                // 요소가 드롭다운 영역을 벗어났는지 확인
                if (elementRect.bottom > dropdownRect.bottom) {
                    // 아래로 스크롤
                    focusedElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                } else if (elementRect.top < dropdownRect.top) {
                    // 위로 스크롤
                    focusedElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }
            }
        }
    }, [focusedIndex]);

    const handleInputChange = (e) => {
        setSearchKeyword(e.target.value);
        setFocusedIndex(-1); // 검색어 변경 시 포커스 초기화
        setIsDropdownOpen(true);
    };

    // 키보드 네비게이션 처리
    const handleInputKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                // 끝에서 멈추도록 변경
                setFocusedIndex(prev => prev < searchResults.length - 1 ? prev + 1 : prev);
                break;
            case 'ArrowUp':
                e.preventDefault();
                // 처음에서 멈추도록 변경
                setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
                    handleAreaSelect(searchResults[focusedIndex]);
                } else if (searchResults.length > 0) {
                    handleAreaSelect(searchResults[0]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                closeDropdown();
                break;
        }
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
        setIsSearchMode(false);
        setSearchKeyword('');
        setFocusedIndex(-1);
    };

    const handleAreaSelect = (area) => {
        // area: { id, emd } 형태
        if (selectedAreas.length >= 3) {
            setShowLimitAlert(true);
            setTimeout(() => setShowLimitAlert(false), 5000);
            return;
        }

        if (!selectedAreas.find(a => a.id === area.id)) {
            setSelectedAreas(prev => [...prev, { id: area.id, name: area.emd }]);
        }

        closeDropdown();
    };

    const handleRemoveArea = (index) => {
        setSelectedAreas(prev => prev.filter((_, i) => i !== index));
        setShowLimitAlert(false);
    };

    const handleSave = async () => {
        try {
            const areaIds = selectedAreas.map(area => area.id);
            await userAPI.updateTradeLocations({ areaIds });
            initialAreas.current = [...selectedAreas];
            setIsConfirmModalOpen(true);
            // 마이페이지 대시보드 즉시 갱신
            await getMypageDashboard();
        } catch (error) {
            const message = error.response?.data?.message || "저장 중 오류가 발생했습니다.";
            alert(message);
        }
    };

    const handleCloseModal = () => setIsConfirmModalOpen(false);

    const hasChanges = JSON.stringify(selectedAreas.map(a => a.id)) !==
        JSON.stringify(initialAreas.current.map(a => a.id));

    return (
        <>
            <div className="trading-area-container">
                <div className="top-group">
                    <p className="info-text">거래지역은 최대 3개까지 선택가능합니다.</p>

                    <div className="search-section">
                        <div className="search-input-container">
                            {!isSearchMode ? (
                                <div
                                    ref={searchInputRef}
                                    className="fake-input"
                                    onClick={() => {
                                        setIsSearchMode(true);
                                        setIsDropdownOpen(true);
                                    }}
                                    tabIndex={0}
                                    role="button"
                                >
                                    <span className="placeholder-left">주소를 검색하세요</span>
                                    <span className="placeholder-right">예: 서초동, 강남구, 마포구 등</span>
                                </div>
                            ) : (
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="real-input"
                                    onChange={handleInputChange}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder="지역명을 입력하세요..."
                                    autoFocus
                                />
                            )}

                            {isDropdownOpen && (
                                <div
                                    ref={dropdownRef}
                                    className="search-dropdown"
                                    role="listbox"
                                    style={{
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}
                                >
                                    <div className="dropdown-content">
                                        <div className="dropdown-results">
                                            {isSearching ? (
                                                    <div className="dropdown-item">검색 중...</div>
                                                ) : searchResults.length === 0 && searchKeyword.trim() !== '' ? (
                                                    <div className="dropdown-item no-results">검색 결과가 없습니다</div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map((area, index) => (
                                                    <div
                                                        key={area.id}
                                                        id={`area-option-${index}`}
                                                        ref={el => dropdownItemRefs.current[index] = el}
                                                        className={`dropdown-item ${
                                                            index === focusedIndex ? 'focused' : ''
                                                        }`}
                                                        role="option"
                                                        onClick={() => handleAreaSelect(area)}
                                                        onMouseEnter={() => setFocusedIndex(index)}
                                                        onMouseLeave={() => setFocusedIndex(-1)}
                                                        tabIndex={-1}
                                                        style={{
                                                            backgroundColor: index === focusedIndex ? '#E3F2FD' : 'white',
                                                            color: index === focusedIndex ? '#1976D2' : 'inherit',
                                                            fontWeight: index === focusedIndex ? '500' : 'normal',
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #f0f0f0'
                                                        }}
                                                    >
                                                        {area.emd}
                                                    </div>
                                                ))
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {showLimitAlert && (
                        <div className="limit-alert">
                            최대 3개 지역이 선택되었습니다. 다른 지역을 선택하려면 기존 지역을 삭제해주세요.
                        </div>
                    )}

                    <div className="selected-areas-section">
                        <div className="selected-areas-header">
                            <span className="selected-areas-title">선택된 거래지역</span>
                            <div className="area-count-badge">
                                <span>{selectedAreas.length}/3</span>
                            </div>
                        </div>

                        <div className="selected-areas-content">
                            {selectedAreas.length === 0 ? (
                                <div className="empty-state">
                                    <p>아직 선택된 거래지역이 없습니다</p>
                                    <p>위에서 지역을 검색해보세요</p>
                                </div>
                            ) : (
                                <div className="areas-list">
                                    {selectedAreas.map((area, index) => (
                                        <div key={area.id} className="area-item">
                                            <span>{area.name}</span>
                                            <button
                                                className="remove-area-btn"
                                                onClick={() => handleRemoveArea(index)}
                                                aria-label={`${area.name} 삭제`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bottom-group">
                    <button
                        className={`save-button ${hasChanges ? 'active' : ''}`}
                        onClick={handleSave}
                        disabled={!hasChanges}
                    >
                        거래지역 저장
                    </button>
                </div>
            </div>

            <ConfirmModal
                open={isConfirmModalOpen}
                title="저장 완료"
                message="거래지역이 성공적으로 저장되었습니다."
                onConfirm={handleCloseModal}
                onCancel={handleCloseModal}
                type={MODAL_TYPES.CONFIRM_ONLY}
            />
        </>
    );
};

export default TradingAreaContent;