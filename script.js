const GITHUB_USERNAME = 'chrisjoiner1989';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

const FALLBACK_PROJECTS = [
    {
        name: 'form-project',
        description: 'This is a simple form project I made with HTML and CSS for code:you module 1',
        html_url: 'https://github.com/chrisjoiner1989/form-project',
        updated_at: '2025-03-22T13:04:42Z'
    },
    {
        name: 'flexbox-wireframe-practice',
        description: 'A web development project practicing flexbox layouts and wireframe design',
        html_url: 'https://github.com/chrisjoiner1989/flexbox-wireframe-practice',
        updated_at: '2025-05-05T23:17:30Z'
    },
    {
        name: 'grid-wireframe-practice',
        description: 'A web development project practicing CSS grid layouts and wireframe design',
        html_url: 'https://github.com/chrisjoiner1989/grid-wireframe-practice',
        updated_at: '2025-01-26T00:56:11Z'
    },
    {
        name: 'Basic-fetch-practice',
        description: 'A web development project practicing JavaScript fetch API and data handling',
        html_url: 'https://github.com/chrisjoiner1989/Basic-fetch-practice',
        updated_at: '2025-06-23T21:42:43Z'
    },
    {
        name: 'About_me',
        description: 'A personal bio page project that introduces who I am, built with basic HTML and designed to practice layout and content organization',
        html_url: 'https://github.com/chrisjoiner1989/About_me',
        updated_at: '2025-01-26T00:56:11Z'
    }
];

function appendProjectToDOM(project) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    const projectHTML = `
        <div class="company-wrapper clearfix">
          <div class="experience-title">${project.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
          <div class="time">Updated: ${new Date(project.updated_at).toLocaleDateString()}</div>
        </div>
        <div class="job-wrapper clearfix">
          <div class="experience-title">${project.description || 'No description available'}</div>
          <div class="company-description">
            <a href="${project.html_url}" target="_blank" style="color: var(--linkColor);">View Repository</a>
            ${project.homepage ? ` | <a href="${project.homepage}" target="_blank" style="color: var(--linkColor);">Live Demo</a>` : ''}
          </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', projectHTML);
}

async function fetchProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    try {
        container.innerHTML = '<div class="loading">Loading projects from GitHub...</div>';
        const response = await fetch(GITHUB_API_URL);
        if (response.status === 403) {
            displayProjects(FALLBACK_PROJECTS, false);
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const projects = await response.json();
        const filteredProjects = projects
            .filter(project => 
                !project.name.includes('chrisjoiner1989.github.io') && 
                !project.fork
            )
            .map(project => ({
                ...project,
                description: project.description || `A web development project called ${project.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
            }))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        const isProjectsPage = window.location.pathname.includes('projects.html');
        const maxProjects = isProjectsPage ? 12 : 6; 
        const limitedProjects = filteredProjects.slice(0, maxProjects);
        if (limitedProjects.length > 0) {
            container.innerHTML = '';
            limitedProjects.forEach(project => {
                appendProjectToDOM(project);
            });
            if (!isProjectsPage) {
                const allProjectsLink = `
                    <div class="company-wrapper clearfix">
                      <div class="experience-title">
                        <a href="projects.html" style="color: var(--linkColor);">View All Projects</a>
                      </div>
                    </div>
                    <div class="job-wrapper clearfix">
                      <div class="company-description">
                        Check out my complete portfolio and more projects on my projects page.
                      </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', allProjectsLink);
            }
        } else {
            displayProjects(FALLBACK_PROJECTS, isProjectsPage);
        }
    } catch (error) {
        displayProjects(FALLBACK_PROJECTS, false);
    }
}

function displayProjects(projects, isProjectsPage = false) {
    const container = document.getElementById('projects-container');
    if (!container) {
        return;
    }
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="company-wrapper clearfix">
              <div class="experience-title">No projects found</div>
            </div>
            <div class="job-wrapper clearfix">
              <div class="company-description">
                Check out my GitHub profile for more projects: 
                <a href="https://github.com/${GITHUB_USERNAME}" target="_blank">@${GITHUB_USERNAME}</a>
              </div>
            </div>
        `;
        return;
    }
    const projectsHTML = projects.map(project => `
        <div class="company-wrapper clearfix">
          <div class="experience-title">${project.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
          <div class="time">Updated: ${new Date(project.updated_at).toLocaleDateString()}</div>
        </div>
        <div class="job-wrapper clearfix">
          <div class="experience-title">${project.description || 'No description available'}</div>
          <div class="company-description">
            <a href="${project.html_url}" target="_blank" style="color: var(--linkColor);">View Repository</a>
            ${project.homepage ? ` | <a href="${project.homepage}" target="_blank" style="color: var(--linkColor);">Live Demo</a>` : ''}
          </div>
        </div>
    `).join('');
    const allProjectsLink = isProjectsPage ? '' : `
        <div class="company-wrapper clearfix">
          <div class="experience-title">
            <a href="projects.html" style="color: var(--linkColor);">View All Projects</a>
          </div>
        </div>
        <div class="job-wrapper clearfix">
          <div class="company-description">
            Check out my complete portfolio and more projects on my projects page.
          </div>
        </div>
    `;
    container.innerHTML = projectsHTML + allProjectsLink;
}

function displayError() {
    const container = document.getElementById('projects-container');
    if (container) {
        container.innerHTML = `
            <div class="company-wrapper clearfix">
              <div class="experience-title">Unable to load projects</div>
            </div>
            <div class="job-wrapper clearfix">
              <div class="company-description">
                There was an error loading projects from GitHub. Please check out my projects directly on 
                <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" style="color: var(--linkColor);">GitHub</a>.
              </div>
            </div>
        `;
    }
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function showLoading() {
    const container = document.getElementById('projects-container');
    if (container) {
        container.innerHTML = '<div class="loading">Loading projects from GitHub...</div>';
    }
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    
    document.querySelectorAll('.project-card, .company-wrapper, .job-wrapper').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function initResponsiveFeatures() {
    const viewport = window.innerWidth;
    if (viewport <= 320) document.body.classList.add('extra-small-screen');
    else if (viewport <= 600) document.body.classList.add('small-screen');
    else if (viewport <= 1024) document.body.classList.add('medium-screen');
    else document.body.classList.add('large-screen');
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.body.style.webkitOverflowScrolling = 'touch';
    }
}

function initTouchGestures() {
    const nav = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger-menu');
    
    if (!nav || !hamburger) return;
    
    let startX = 0;
    let isDragging = false;
    
    hamburger.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = false;
    });
    
    hamburger.addEventListener('touchend', (e) => {
        if (isDragging) {
            const deltaX = e.changedTouches[0].clientX - startX;
            if (deltaX > 50 && nav.classList.contains('active')) {
                hamburger.click();
            }
        }
    });
}

function initPerformanceOptimizations() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;
    if (isMobile || isLowEndDevice) {
        document.body.classList.add('reduced-motion');
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    }
}

function initResponsiveFonts() {
    const setFontSize = () => {
        const viewport = window.innerWidth;
        const baseSize = Math.max(12, Math.min(16, viewport / 100));
        document.documentElement.style.fontSize = `${baseSize}px`;
    };
    setFontSize();
    window.addEventListener('resize', setFontSize);
}

function initViewportAwareLoading() {
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };
    
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        const projectsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fetchProjects();
                    projectsObserver.unobserve(entry.target);
                }
            });
        });
        
        projectsObserver.observe(projectsContainer);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initResponsiveFeatures();
    initTouchGestures();
    initPerformanceOptimizations();
    initResponsiveFonts();
    initViewportAwareLoading();
    initSmoothScrolling();
    addScrollAnimations();
    addInteractiveFeatures();
    if (window.location.pathname.includes('projects.html') || document.getElementById('projects-container')) {
    }
});

function addInteractiveFeatures() {
    
    const contactLinks = document.querySelectorAll('.contact-info a, .project-links a');
    contactLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'color 0.3s ease';
        });
    });
    
    
    document.addEventListener('click', function(e) {
        if (e.target.matches('.project-links a') || e.target.matches('.company-description a')) {
            console.log('Project link clicked:', e.target.href);
        }
    });
    
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

function initializeApp() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobile) document.body.classList.add('mobile-device');
    if (isTouchDevice) document.body.classList.add('touch-device');
    initResponsiveFeatures();
    if (window.location.pathname.includes('projects.html') || document.getElementById('projects-container')) {
        fetchProjects();
    }
    if (window.requestIdleCallback) {
        requestIdleCallback(() => {
            initTouchGestures();
            initPerformanceOptimizations();
            initResponsiveFonts();
            addInteractiveFeatures();
        });
    } else {
        setTimeout(() => {
            initTouchGestures();
            initPerformanceOptimizations();
            initResponsiveFonts();
            addInteractiveFeatures();
        }, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp(); 
} 