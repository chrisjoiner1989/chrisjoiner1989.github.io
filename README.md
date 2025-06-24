# Chris Joiner - Web Developer Portfolio

A modern, responsive personal portfolio website showcasing my skills, experience, and projects with a sleek two-column layout design.

## Features

- **Modern Design**: Clean, professional two-column layout with Varela Round and Open Sans typography
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **GitHub Integration**: Projects are dynamically loaded from the GitHub API
- **Animated Skills**: Interactive skill bars with smooth animations
- **Consistent Styling**: Unified design language across all pages

## Design

The portfolio features a modern two-column layout:

- **Left Column**: Profile section with photo, contact info, and personal summary
- **Right Column**: Experience, skills, and projects with dark background for contrast

### Color Scheme

- Primary: `#66cc99` (Green)
- Background: `#fff` (White) and `#3d3e42` (Dark Gray)
- Text: `#9099a0` (Light Gray) and `#4a4e51` (Dark Gray)

## Pages

- **Home/Resume** (`index.html`): Main portfolio page with resume information
- **Projects** (`projects.html`): Dedicated projects page with GitHub integration

## Technologies Used

- HTML5
- CSS3 (with CSS Variables and modern layout techniques)
- JavaScript (ES6+)
- GitHub API
- Google Fonts (Varela Round, Open Sans)

## Setup

1. Clone the repository
2. Open `index.html` in a web browser
3. For local development, use a local server:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## GitHub API Integration

The site automatically fetches and displays projects from my GitHub profile:

- Filters out forked repositories
- Shows project descriptions and links
- Displays last updated dates
- Includes links to live demos when available
- Fallback data if API is unavailable

## Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 850px - 1199px
- **Mobile**: 450px - 849px
- **Small Mobile**: Below 450px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility Features

- High contrast mode support
- Reduced motion support for users with vestibular disorders
- Keyboard navigation
- Screen reader friendly structure
- Print-friendly styles

## License

This project is open source and available under the [MIT License](LICENSE).
