/**
 * Gallery and modal functionality for Excaliber Construction website
 * Handles portfolio image viewing and modal interactions
 */

class GalleryController {
    constructor() {
        this.modal = null;
        this.modalImage = null;
        this.currentImageIndex = 0;
        this.images = [];
        
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
        this.initLazyLoading();
        this.initImageOptimization();
    }

    createModal() {
        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        
        if (!this.modal || !this.modalImage) {
            console.warn('Modal elements not found');
            return;
        }
    }

    setupEventListeners() {
        // Portfolio image clicks
        const portfolioButtons = document.querySelectorAll('.portfolio-btn');
        portfolioButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const imageSrc = btn.getAttribute('data-image');
                this.openModal(imageSrc, index);
            });
        });

        // Modal close events
        if (this.modal) {
            const closeBtn = document.getElementById('modalClose');
            const overlay = this.modal.querySelector('.modal-overlay');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }
            
            if (overlay) {
                overlay.addEventListener('click', () => this.closeModal());
            }
            
            // Keyboard events
            document.addEventListener('keydown', (e) => {
                if (this.modal.classList.contains('active')) {
                    switch(e.key) {
                        case 'Escape':
                            this.closeModal();
                            break;
                        case 'ArrowLeft':
                            this.previousImage();
                            break;
                        case 'ArrowRight':
                            this.nextImage();
                            break;
                    }
                }
            });
        }

        // Touch events for mobile swipe
        this.initTouchEvents();
    }

    openModal(imageSrc, index = 0) {
        if (!this.modal || !this.modalImage) return;
        
        this.currentImageIndex = index;
        this.collectAllImages();
        
        this.modalImage.src = imageSrc;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Preload adjacent images
        this.preloadAdjacentImages();
        
        // Add opening animation
        this.animateModalOpen();
    }

    closeModal() {
        if (!this.modal) return;
        
        this.animateModalClose(() => {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    collectAllImages() {
        const portfolioButtons = document.querySelectorAll('.portfolio-btn');
        this.images = Array.from(portfolioButtons).map(btn => 
            btn.getAttribute('data-image')
        );
    }

    nextImage() {
        if (this.images.length === 0) return;
        
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.changeImage(this.images[this.currentImageIndex], 'next');
    }

    previousImage() {
        if (this.images.length === 0) return;
        
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.changeImage(this.images[this.currentImageIndex], 'prev');
    }

    changeImage(newSrc, direction) {
        if (!this.modalImage) return;
        
        // Animate image transition
        this.modalImage.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        this.modalImage.style.transform = direction === 'next' ? 'translateX(-100px)' : 'translateX(100px)';
        this.modalImage.style.opacity = '0';
        
        setTimeout(() => {
            this.modalImage.src = newSrc;
            this.modalImage.style.transform = direction === 'next' ? 'translateX(100px)' : 'translateX(-100px)';
            
            setTimeout(() => {
                this.modalImage.style.transform = 'translateX(0)';
                this.modalImage.style.opacity = '1';
            }, 50);
        }, 150);
        
        // Reset transition after animation
        setTimeout(() => {
            this.modalImage.style.transition = '';
        }, 350);
        
        this.preloadAdjacentImages();
    }

    preloadAdjacentImages() {
        if (this.images.length === 0) return;
        
        // Preload next and previous images
        const nextIndex = (this.currentImageIndex + 1) % this.images.length;
        const prevIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        
        [nextIndex, prevIndex].forEach(index => {
            const img = new Image();
            img.src = this.images[index];
        });
    }

    animateModalOpen() {
        if (!this.modal) return;
        
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.8)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                modalContent.style.transform = 'scale(1)';
                modalContent.style.opacity = '1';
            }, 50);
        }
    }

    animateModalClose(callback) {
        if (!this.modal) return;
        
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            modalContent.style.transform = 'scale(0.8)';
            modalContent.style.opacity = '0';
            
            setTimeout(callback, 300);
        } else {
            callback();
        }
    }

    initTouchEvents() {
        if (!this.modal) return;
        
        let startX = 0;
        let endX = 0;
        
        this.modal.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.modal.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        });
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe left - next image
                this.nextImage();
            } else {
                // Swipe right - previous image
                this.previousImage();
            }
        }
    }

    initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => this.loadImage(img));
        }
    }

    loadImage(img) {
        img.addEventListener('load', () => {
            img.style.opacity = '1';
            img.classList.add('loaded');
        });
        
        img.addEventListener('error', () => {
            img.style.opacity = '0.5';
            img.classList.add('error');
            console.warn('Failed to load image:', img.src);
        });
        
        // Add loading animation
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    }

    initImageOptimization() {
        // Add srcset for responsive images
        const portfolioImages = document.querySelectorAll('.portfolio-image img');
        
        portfolioImages.forEach(img => {
            this.optimizeImage(img);
        });
    }

    optimizeImage(img) {
        const src = img.src;
        
        // Create responsive image sources
        const sizes = [400, 600, 800, 1200];
        const srcset = sizes.map(size => {
            // For Pixabay images, we can add size parameters
            const optimizedSrc = this.getOptimizedImageUrl(src, size);
            return `${optimizedSrc} ${size}w`;
        }).join(', ');
        
        if (srcset) {
            img.srcset = srcset;
            img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
        }
    }

    getOptimizedImageUrl(originalUrl, width) {
        // For Pixabay images, we can modify the URL to get different sizes
        if (originalUrl.includes('pixabay.com')) {
            // Replace the resolution in Pixabay URLs
            return originalUrl.replace('_1280.jpg', `_${width}.jpg`);
        }
        
        return originalUrl;
    }

    // Utility method to refresh gallery after dynamic content updates
    refresh() {
        this.setupEventListeners();
        this.initLazyLoading();
        this.initImageOptimization();
    }

    // Method to add new images to the gallery
    addImage(imageSrc, thumbnailSrc, caption = '') {
        // This method can be used to dynamically add images to the gallery
        this.images.push(imageSrc);
    }

    // Method to get gallery statistics
    getStats() {
        return {
            totalImages: this.images.length,
            currentIndex: this.currentImageIndex,
            modalOpen: this.modal ? this.modal.classList.contains('active') : false
        };
    }
}

// Initialize gallery controller
document.addEventListener('DOMContentLoaded', () => {
    new GalleryController();
});

// Add CSS for gallery enhancements
const galleryStyles = `
    .portfolio-image img {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .portfolio-image img.loaded {
        opacity: 1;
    }
    
    .portfolio-image img.error {
        opacity: 0.5;
        filter: grayscale(100%);
    }
    
    .modal-content {
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
    
    .modal-content img {
        transition: transform 0.3s ease, opacity 0.3s ease;
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
    }
    
    @media (max-width: 768px) {
        .modal-content {
            max-width: 95%;
            max-height: 85%;
        }
        
        .modal-close {
            top: -40px;
            right: 10px;
            width: 35px;
            height: 35px;
        }
    }
`;

// Inject gallery styles
const galleryStyleSheet = document.createElement('style');
galleryStyleSheet.textContent = galleryStyles;
document.head.appendChild(galleryStyleSheet);