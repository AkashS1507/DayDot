        const heatmap = document.getElementById('heatmap');
        const tooltip = document.getElementById('tooltip');
        const tickBtn = document.getElementById('tickBtn');
        const crossBtn = document.getElementById('crossBtn');
        
        let selectedDay = null;
        const tickedDays = new Set();

        // Load ticked days from localStorage
        function loadTickedDays() {
            const saved = localStorage.getItem('tickedDays2026');
            if (saved) {
                const days = JSON.parse(saved);
                days.forEach(day => tickedDays.add(day));
            }
        }

        // Save ticked days to localStorage
        function saveTickedDays() {
            localStorage.setItem('tickedDays2026', JSON.stringify([...tickedDays]));
        }

        // Generate heatmap for current year
        function generateHeatmap() {
            const year = 2026;
            
            // Generate for each month of the year
            for (let month = 0; month < 12; month++) {
                const firstDayOfMonth = new Date(year, month, 1);
                const lastDayOfMonth = new Date(year, month + 1, 0); // Day 0 of next month = last day of current month
                
                // Create month container
                const monthContainer = document.createElement('div');
                monthContainer.style.display = 'flex';
                monthContainer.style.gap = '3px';
                
                // Find the Sunday before or on the first day of the month
                let currentDate = new Date(firstDayOfMonth);
                const firstDayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
                currentDate.setDate(currentDate.getDate() - firstDayOfWeek);
                
                // Generate weeks until we've covered the entire month
                while (currentDate <= lastDayOfMonth) {
                    const weekColumn = document.createElement('div');
                    weekColumn.className = 'month-column';
                    
                    // Create 7 days for this week
                    for (let day = 0; day < 7; day++) {
                        const dateStr = currentDate.toISOString().split('T')[0];
                        const box = document.createElement('div');
                        box.className = 'day-box';
                        box.dataset.date = dateStr;
                        box.dataset.fullDate = formatDate(currentDate);
                        
                        // Check if day is ticked from localStorage
                        if (tickedDays.has(dateStr)) {
                            box.classList.add('ticked');
                        }
                        
                        // Check if this day belongs to the current month
                        const isCurrentMonth = currentDate.getMonth() === month;
                        
                        if (isCurrentMonth) {
                            // Days in the current month are fully interactive
                            box.addEventListener('click', () => selectDay(box));
                            box.addEventListener('mouseenter', showTooltip);
                            box.addEventListener('mouseleave', hideTooltip);
                        } else {
                            // Days from other months are dimmed and non-interactive
                            box.style.opacity = '0.3';
                            box.style.cursor = 'default';
                            box.style.pointerEvents = 'none';
                        }
                        
                        weekColumn.appendChild(box);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                    
                    monthContainer.appendChild(weekColumn);
                }
                
                // Add month container to heatmap
                heatmap.appendChild(monthContainer);
            }
        }

        function formatDate(date) {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
            const day = date.getDate().toString().padStart(2, '0');
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        }

        function selectDay(box) {
            // Remove previous selection
            if (selectedDay) {
                selectedDay.classList.remove('selected');
            }
            
            // Select new day
            selectedDay = box;
            box.classList.add('selected');
            
            // Enable buttons
            tickBtn.disabled = false;
            crossBtn.disabled = false;
        }

        function showTooltip(e) {
            const box = e.target;
            const fullDate = box.dataset.fullDate;
            
            if (!fullDate) return;
            
            tooltip.textContent = fullDate;
            tooltip.style.display = 'block';
            
            updateTooltipPosition(e);
        }

        function updateTooltipPosition(e) {
            const tooltipRect = tooltip.getBoundingClientRect();
            const padding = 10;
            
            let left = e.clientX + padding;
            let top = e.clientY + padding;
            
            // Adjust if tooltip goes off screen
            if (left + tooltipRect.width > window.innerWidth) {
                left = e.clientX - tooltipRect.width - padding;
            }
            
            if (top + tooltipRect.height > window.innerHeight) {
                top = e.clientY - tooltipRect.height - padding;
            }
            
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        }

        function hideTooltip() {
            tooltip.style.display = 'none';
        }

        // Handle mouse movement for tooltip
        document.addEventListener('mousemove', (e) => {
            if (tooltip.style.display === 'block') {
                updateTooltipPosition(e);
            }
        });

        tickBtn.addEventListener('click', () => {
            if (selectedDay) {
                selectedDay.classList.add('ticked');
                tickedDays.add(selectedDay.dataset.date);
                saveTickedDays();
                selectedDay.classList.remove('selected');
                selectedDay = null;
                tickBtn.disabled = true;
                crossBtn.disabled = true;
            }
        });

        crossBtn.addEventListener('click', () => {
            if (selectedDay) {
                // If the day is ticked, untick it
                if (selectedDay.classList.contains('ticked')) {
                    selectedDay.classList.remove('ticked');
                    tickedDays.delete(selectedDay.dataset.date);
                    saveTickedDays();
                }
                
                selectedDay.classList.remove('selected');
                selectedDay = null;
                tickBtn.disabled = true;
                crossBtn.disabled = true;
            }
        });

        // Initialize heatmap
        loadTickedDays();
        generateHeatmap();

        //PWA
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("service-worker.js");  
        }
