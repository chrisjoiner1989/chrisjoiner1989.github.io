// GitHub API configuration
const GITHUB_USERNAME = 'chrisjoiner1989';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// Fallback projects data in case API fails
const FALLBACK_PROJECTS = [
    {
        name: 'Recipe Page',
        description: 'A simple HTML page showcasing a recipe layout. Great practice in using semantic HTML and basic page structure.',
        html_url: 'https://github.com/chrisjoiner1989/Recipe-page',
        updated_at: '2024-01-01T00:00:00Z'
    },
    {
        name: 'About Me',
        description: 'A personal bio page project that introduces who I am, built with basic HTML and designed to practice layout and content organization.',
        html_url: 'https://github.com/chrisjoiner1989/About_me',
        updated_at: '2024-01-01T00:00:00Z'
    },
    {
        name: 'Form Project',
        description: 'An HTML form project demonstrating form elements like inputs, labels, and buttons for user data submission.',
        html_url: 'https://github.com/chrisjoiner1989/form-project',
        updated_at: '2024-01-01T00:00:00Z'
    }
];

// Function to fetch projects from GitHub API
async function fetchProjects() {
    try {
        const response = await fetch(GITHUB_API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const projects = await response.json();
        
        // Filter and sort projects (exclude this portfolio site and sort by updated date)
        const filteredProjects = projects
            .filter(project => 
                !project.name.includes('chrisjoiner1989.github.io') && 
                !project.fork && 
                project.description
            )
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 6); // Limit to 6 most recent projects
        
        if (filteredProjects.length > 0) {
            displayProjects(filteredProjects);
        } else {
            // If no projects found, use fallback data
            displayProjects(FALLBACK_PROJECTS);
        }
        
    } catch (error) {
        console.error('Error fetching projects:', error);
        // Use fallback data on error
        displayProjects(FALLBACK_PROJECTS);
    }
}

// Function to display projects
function displayProjects(projects) {
    const container = document.getElementById('projects-container');
    
    if (!container) {
        console.warn('Projects container not found');
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
    
    // Create project cards in the new layout style
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
    
    // Add link to all projects
    const allProjectsLink = `
        <div class="company-wrapper clearfix">
          <div class="experience-title">
            <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" style="color: var(--linkColor);">View All Projects on GitHub</a>
          </div>
        </div>
        <div class="job-wrapper clearfix">
          <div class="company-description">
            Check out my complete portfolio and more projects on my GitHub profile.
          </div>
        </div>
    `;
    
    container.innerHTML = projectsHTML + allProjectsLink;
}

// Function to display error message
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

// Function to add smooth scrolling for anchor links
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

// Function to add loading animation
function showLoading() {
    const container = document.getElementById('projects-container');
    if (container) {
        container.innerHTML = '<div class="loading">Loading projects from GitHub...</div>';
    }
}

// Function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Function to add scroll animations
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
    
    // Observe all project cards and items
    document.querySelectorAll('.project-card, .company-wrapper, .job-wrapper').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Show loading state
    showLoading();
    
    // Fetch projects after a short delay to show loading animation
    setTimeout(() => {
        fetchProjects();
    }, 500);
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Add some interactive features
    addInteractiveFeatures();
    
    // Add scroll animations after projects are loaded
    setTimeout(() => {
        addScrollAnimations();
    }, 1000);
});

// Function to add interactive features
function addInteractiveFeatures() {
    // Add hover effects for contact links
    const contactLinks = document.querySelectorAll('.contact-info a, .project-links a');
    contactLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'color 0.3s ease';
        });
    });
    
    // Add click tracking for project links (for analytics if needed)
    document.addEventListener('click', function(e) {
        if (e.target.matches('.project-links a') || e.target.matches('.company-description a')) {
            console.log('Project link clicked:', e.target.href);
        }
    });
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open modals or return to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// Add error handling for image loading
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            console.warn('Failed to load image:', this.src);
        });
        
        // Add loading animation for images
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Set initial opacity for smooth loading
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
});

// Add hamburger menu functionality
function initHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;
    
    if (!hamburgerMenu || !navMenu) {
        console.warn('Hamburger menu elements not found');
        return;
    }
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    body.appendChild(overlay);
    
    // Toggle menu function
    function toggleMenu() {
        hamburgerMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }
    
    // Event listeners
    hamburgerMenu.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Close menu when clicking on a nav link
    navMenu.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            setTimeout(toggleMenu, 100); // Small delay to allow navigation
        }
    });
    
    // Close menu on window resize (if menu is open)
    window.addEventListener('resize', function() {
        if (navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
}

// Initialize hamburger menu
document.addEventListener('DOMContentLoaded', initHamburgerMenu); 