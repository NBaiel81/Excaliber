/**
 * Animation system for Excaliber Construction website
 * Handles scroll-triggered animations and interactive effects
 */

class AnimationController {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.initParallaxEffects();
        this.initHoverAnimations();
        this.initStaggeredAnimations();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerAnimation(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe all animatable elements
        const animatedElements = document.querySelectorAll(
            '.animate-fade-up, .animate-slide-left, .animate-slide-right, .service-card, .portfolio-item'
        );

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    triggerAnimation(element) {
        const delay = element.dataset.delay || 0;
        
        setTimeout(() => {
            element.classList.add('animated');
            
            // Special handling for service cards
            if (element.classList.contains('service-card')) {
                this.animateServiceCard(element);
            }
            
            // Special handling for portfolio items
            if (element.classList.contains('portfolio-item')) {
                this.animatePortfolioItem(element);
            }
        }, delay * 1000);
    }

    animateServiceCard(card) {
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
        
        // Animate icon
        const icon = card.querySelector('.service-icon');
        if (icon) {
            icon.style.animation = 'bounceIn 0.6s ease 0.2s both';
        }
        
        // Animate content
        const title = card.querySelector('.service-title');
        const description = card.querySelector('.service-description');
        const features = card.querySelector('.service-features');
        const link = card.querySelector('.service-link');
        
        [title, description, features, link].forEach((element, index) => {
            if (element) {
                element.style.animation = `fadeInUp 0.5s ease ${0.3 + index * 0.1}s both`;
            }
        });
    }

    animatePortfolioItem(item) {
        item.style.transform = 'translateY(0)';
        item.style.opacity = '1';
        
        // Animate image
        const image = item.querySelector('.portfolio-image img');
        if (image) {
            image.style.animation = 'zoomIn 0.6s ease both';
        }
        
        // Animate content
        const content = item.querySelector('.portfolio-content');
        if (content) {
            content.style.animation = 'slideInUp 0.5s ease 0.2s both';
        }
    }

    initParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero-image');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                if (element.style.transform !== undefined) {
                    element.style.transform = `translateY(${rate}px)`;
                }
            });
        });
    }

    initHoverAnimations() {
        // Service card hover effects
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateServiceCardHover(card, true);
            });
            
            card.addEventListener('mouseleave', () => {
                this.animateServiceCardHover(card, false);
            });
        });

        // Portfolio item hover effects
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.animatePortfolioHover(item, true);
            });
            
            item.addEventListener('mouseleave', () => {
                this.animatePortfolioHover(item, false);
            });
        });

        // Button hover effects
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.animateButtonHover(button, true);
            });
            
            button.addEventListener('mouseleave', () => {
                this.animateButtonHover(button, false);
            });
        });
    }

    animateServiceCardHover(card, isHover) {
        const icon = card.querySelector('.service-icon');
        const link = card.querySelector('.service-link');
        
        if (isHover) {
            if (icon) {
                icon.style.animation = 'pulse 0.5s ease';
            }
            if (link) {
                link.style.transform = 'translateX(5px)';
            }
        } else {
            if (icon) {
                icon.style.animation = '';
            }
            if (link) {
                link.style.transform = 'translateX(0)';
            }
        }
    }

    animatePortfolioHover(item, isHover) {
        const overlay = item.querySelector('.portfolio-overlay');
        const btn = item.querySelector('.portfolio-btn');
        
        if (isHover) {
            if (overlay) {
                overlay.style.opacity = '1';
            }
            if (btn) {
                btn.style.animation = 'bounceIn 0.3s ease';
            }
        } else {
            if (overlay) {
                overlay.style.opacity = '0';
            }
            if (btn) {
                btn.style.animation = '';
            }
        }
    }

    animateButtonHover(button, isHover) {
        const icon = button.querySelector('i');
        
        if (isHover) {
            button.style.transform = 'translateY(-2px)';
            if (icon) {
                icon.style.animation = 'wobble 0.5s ease';
            }
        } else {
            button.style.transform = 'translateY(0)';
            if (icon) {
                icon.style.animation = '';
            }
        }
    }

    initStaggeredAnimations() {
        // Stagger animations for elements in containers
        const containers = [
            { selector: '.services-grid', childSelector: '.service-card' },
            { selector: '.portfolio-grid', childSelector: '.portfolio-item' },
            { selector: '.feature-list', childSelector: '.feature-item' }
        ];

        containers.forEach(container => {
            const containerElement = document.querySelector(container.selector);
            if (containerElement) {
                const children = containerElement.querySelectorAll(container.childSelector);
                
                children.forEach((child, index) => {
                    child.style.animationDelay = `${index * 0.1}s`;
                });
            }
        });
    }

    // Utility method to add custom animations
    addCustomAnimation(element, animationName, duration = '0.5s', delay = '0s') {
        element.style.animation = `${animationName} ${duration} ease ${delay} both`;
    }

    // Method to reset animations
    resetAnimation(element) {
        element.style.animation = '';
        element.classList.remove('animated');
    }
}

// CSS animations to be added dynamically
const animationStyles = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes zoomIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes bounceIn {
        0% {
            opacity: 0;
            transform: scale(0.3);
        }
        50% {
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes wobble {
        0% {
            transform: translateX(0);
        }
        15% {
            transform: translateX(-5px) rotate(-5deg);
        }
        30% {
            transform: translateX(5px) rotate(3deg);
        }
        45% {
            transform: translateX(-3px) rotate(-3deg);
        }
        60% {
            transform: translateX(3px) rotate(2deg);
        }
        75% {
            transform: translateX(-1px) rotate(-1deg);
        }
        100% {
            transform: translateX(0);
        }
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes rotateIn {
        from {
            opacity: 0;
            transform: rotate(-180deg);
        }
        to {
            opacity: 1;
            transform: rotate(0);
        }
    }

    @keyframes flipInX {
        from {
            opacity: 0;
            transform: perspective(400px) rotateX(90deg);
        }
        40% {
            transform: perspective(400px) rotateX(-20deg);
        }
        60% {
            transform: perspective(400px) rotateX(10deg);
        }
        80% {
            transform: perspective(400px) rotateX(-5deg);
        }
        to {
            opacity: 1;
            transform: perspective(400px);
        }
    }
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Initialize animation controller
document.addEventListener('DOMContentLoaded', () => {
    new AnimationController();
});