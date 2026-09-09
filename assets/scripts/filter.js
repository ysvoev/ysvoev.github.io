document.addEventListener('DOMContentLoaded', function () {
    const filterLinks = document.querySelectorAll('.filter a');
    let activeFilters = [];
    let animationTimeouts = [];
    let isFilterApplied = false;

    const ANIMATION_SPEED = 160;
    const STAGGER_DELAY = 80;
    const FILTER_MODE = 'any';

    function applyFiltersWithAnimation(filters) {
        const portfolioItems = document.querySelectorAll('.portfolio .page');
        
        if (portfolioItems.length === 0) {
            setTimeout(() => {
                applyFiltersWithAnimation(filters);
            }, 100);
            return;
        }
        
        animationTimeouts.forEach(timeout => clearTimeout(timeout));
        animationTimeouts = [];

        const visibilityMap = new Map();
        portfolioItems.forEach(item => {
            const itemFilters = item.dataset.filter ? item.dataset.filter.split(' ') : [];
            
            let shouldShow;
            if (!filters || filters.length === 0) {
                shouldShow = true;
            } else if (FILTER_MODE === 'all') {
                shouldShow = filters.every(filter => 
                    itemFilters.some(itemFilter => itemFilter === filter)
                );
            } else {
                shouldShow = filters.some(filter => 
                    itemFilters.some(itemFilter => itemFilter === filter)
                );
            }
            
            visibilityMap.set(item, shouldShow);
        });

        let hideDelay = 0;
        portfolioItems.forEach(item => {
            const shouldShow = visibilityMap.get(item);
            
            if (!shouldShow && !item.classList.contains('none')) {
                const timeout = setTimeout(() => {
                    item.classList.add('hiding');
                    const hideTimeout = setTimeout(() => {
                        item.classList.add('none');
                        item.classList.remove('hiding');
                    }, ANIMATION_SPEED);
                    animationTimeouts.push(hideTimeout);
                }, hideDelay);
                animationTimeouts.push(timeout);
                hideDelay += STAGGER_DELAY;
            }
        });

        let showDelay = 0;
        portfolioItems.forEach(item => {
            const shouldShow = visibilityMap.get(item);
            
            if (shouldShow && item.classList.contains('none')) {
                const timeout = setTimeout(() => {
                    item.classList.remove('none');
                    item.classList.add('showing');
                    requestAnimationFrame(() => {
                        item.classList.remove('showing');
                    });
                }, showDelay);
                animationTimeouts.push(timeout);
                showDelay += STAGGER_DELAY;
            } else if (shouldShow) {
                item.classList.remove('hiding', 'showing');
            }
        });

        activeFilters = filters || [];
        isFilterApplied = true;
    }

    function buildHashFromFilters(filters) {
        if (!filters || filters.length === 0) return '';
        const sorted = [...filters].sort();
        const clean = sorted.map(f => f.replace(/^&+/, '')).filter(f => f);
        return '&' + clean.join('&');
    }

    function getFiltersFromHash() {
        const hash = window.location.hash;
        
        if (!hash) {
            return [];
        }
        
        let cleanHash = hash;
        if (cleanHash.startsWith('#')) {
            cleanHash = cleanHash.slice(1);
        }
        
        if (!cleanHash.includes('&')) {
            return [];
        }
        
        const parts = cleanHash.split('&');
        
        const filters = parts
            .filter(f => f)
            .map(f => f.startsWith('&') ? f : '&' + f);
        
        return filters;
    }

    function getCategoryFromHref(href) {
        const match = href.match(/[#\/]?(&[^&#/]+)/);
        if (match) {
            return match[1];
        }
        return null;
    }

    function forceApplyFilters() {
        const filters = getFiltersFromHash();
        
        if (filters && filters.length > 0) {
            applyFiltersWithAnimation(filters);
            return true;
        } else {
            return false;
        }
    }

    const initialFilters = getFiltersFromHash();
    if (initialFilters && initialFilters.length > 0) {
        const items = document.querySelectorAll('.portfolio .page');
        if (items.length > 0) {
            applyFiltersWithAnimation(initialFilters);
        } else {
            setTimeout(() => {
                forceApplyFilters();
            }, 50);
        }
    }

    window.addEventListener('load', function() {
        forceApplyFilters();
    });

    setTimeout(function() {
        forceApplyFilters();
    }, 200);

    setTimeout(function() {
        forceApplyFilters();
    }, 500);

    setTimeout(function() {
        if (!isFilterApplied) {
            forceApplyFilters();
        }
    }, 1000);

    filterLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // ---- Логика сброса фильтра (весь поток) ----
            if (this.dataset.filter === '&all') {
                applyFiltersWithAnimation([]);
                history.pushState(null, '', window.location.pathname);
                return;
            }
            // -------------------------------------------

            const category = getCategoryFromHref(this.getAttribute('href'));
            if (!category) {
                return;
            }

            const isActive = activeFilters.includes(category);

            let newFilters;
            if (isActive) {
                newFilters = activeFilters.filter(f => f !== category);
            } else {
                newFilters = [...activeFilters, category];
            }

            applyFiltersWithAnimation(newFilters);

            const newHash = buildHashFromFilters(newFilters);
            
            if (newHash) {
                history.pushState(null, '', '#' + newHash);
            } else {
                history.pushState(null, '', window.location.pathname);
            }
        });
    });

    window.addEventListener('hashchange', function () {
        const filters = getFiltersFromHash();
        if (filters && filters.length > 0) {
            applyFiltersWithAnimation(filters);
        } else {
            applyFiltersWithAnimation([]);
        }
    });
});