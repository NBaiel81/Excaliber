/**
 * Form handling and validation for Excaliber Construction website
 * Provides professional form interactions, validation, and submission
 */

class FormController {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        this.currentSubmission = null;
        
        this.init();
    }

    init() {
        this.setupValidators();
        this.initializeForms();
        this.setupEventListeners();
        this.initInputEnhancements();
    }

    setupValidators() {
        // Email validation
        this.validators.set('email', {
            test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Please enter a valid email address'
        });

        // Phone validation
        this.validators.set('phone', {
            test: (value) => /^[\+]?[\d\s\-\(\)]{10,}$/.test(value),
            message: 'Please enter a valid phone number'
        });

        // Required field validation
        this.validators.set('required', {
            test: (value) => value.trim().length > 0,
            message: 'This field is required'
        });

        // Name validation
        this.validators.set('name', {
            test: (value) => /^[a-zA-Z\s]{2,}$/.test(value),
            message: 'Please enter a valid name (letters only, minimum 2 characters)'
        });

        // Message validation
        this.validators.set('message', {
            test: (value) => value.trim().length >= 10,
            message: 'Please provide at least 10 characters for your message'
        });
    }

    initializeForms() {
        const contactForm = document.getElementById('contactForm');
        
        if (contactForm) {
            this.forms.set('contact', {
                element: contactForm,
                fields: this.getFormFields(contactForm),
                submitButton: contactForm.querySelector('button[type="submit"]'),
                successElement: contactForm.querySelector('.form-success'),
                endpoint: '/api/contact', // This would be the actual endpoint
                onSuccess: (response) => this.handleContactSuccess(response),
                onError: (error) => this.handleContactError(error)
            });
        }
    }

    getFormFields(form) {
        const fields = new Map();
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const rules = this.getValidationRules(input);
            fields.set(input.name, {
                element: input,
                rules: rules,
                errorElement: input.parentNode.querySelector('.error-message'),
                isValid: false,
                touched: false
            });
        });
        
        return fields;
    }

    getValidationRules(input) {
        const rules = [];
        
        // Check for required attribute
        if (input.hasAttribute('required')) {
            rules.push('required');
        }
        
        // Check input type
        switch (input.type) {
            case 'email':
                rules.push('email');
                break;
            case 'tel':
                rules.push('phone');
                break;
        }
        
        // Check by name/id
        if (input.name.includes('name') || input.id.includes('Name')) {
            rules.push('name');
        }
        
        if (input.name === 'message' || input.id === 'message') {
            rules.push('message');
        }
        
        return rules;
    }

    setupEventListeners() {
        this.forms.forEach((formData, formName) => {
            const { element, fields, submitButton } = formData;
            
            // Form submission
            element.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(formName);
            });
            
            // Field validation
            fields.forEach((fieldData, fieldName) => {
                const { element: input } = fieldData;
                
                // Real-time validation on blur
                input.addEventListener('blur', () => {
                    this.validateField(formName, fieldName);
                    fieldData.touched = true;
                });
                
                // Clear errors on focus
                input.addEventListener('focus', () => {
                    this.clearFieldError(formName, fieldName);
                });
                
                // Live validation for touched fields
                input.addEventListener('input', () => {
                    if (fieldData.touched) {
                        setTimeout(() => {
                            this.validateField(formName, fieldName);
                        }, 300);
                    }
                });
            });
        });
    }

    initInputEnhancements() {
        // Phone number formatting
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        });

        // Text input animations
        const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
        textInputs.forEach(input => {
            this.initInputAnimation(input);
        });

        // Select styling
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            this.enhanceSelect(select);
        });
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        
        input.value = value;
    }

    initInputAnimation(input) {
        const parent = input.parentNode;
        
        // Add focus/blur animations
        input.addEventListener('focus', () => {
            parent.classList.add('focused');
            this.animateLabel(input, true);
        });
        
        input.addEventListener('blur', () => {
            if (!input.value.trim()) {
                parent.classList.remove('focused');
                this.animateLabel(input, false);
            }
        });
        
        // Check initial state
        if (input.value.trim()) {
            parent.classList.add('focused');
        }
    }

    animateLabel(input, isFocused) {
        const label = input.parentNode.querySelector('label');
        if (!label) return;
        
        if (isFocused) {
            label.style.transform = 'translateY(-20px) scale(0.8)';
            label.style.color = 'var(--primary-color)';
        } else {
            label.style.transform = 'translateY(0) scale(1)';
            label.style.color = '';
        }
    }

    enhanceSelect(select) {
        select.addEventListener('change', () => {
            if (select.value) {
                select.parentNode.classList.add('has-value');
            } else {
                select.parentNode.classList.remove('has-value');
            }
        });
        
        // Check initial state
        if (select.value) {
            select.parentNode.classList.add('has-value');
        }
    }

    validateField(formName, fieldName) {
        const formData = this.forms.get(formName);
        if (!formData) return false;
        
        const fieldData = formData.fields.get(fieldName);
        if (!fieldData) return false;
        
        const { element: input, rules, errorElement } = fieldData;
        const value = input.value;
        
        // Clear previous errors
        this.clearFieldError(formName, fieldName);
        
        // Run validation rules
        for (const rule of rules) {
            const validator = this.validators.get(rule);
            if (validator && !validator.test(value)) {
                this.showFieldError(formName, fieldName, validator.message);
                fieldData.isValid = false;
                return false;
            }
        }
        
        // Field is valid
        fieldData.isValid = true;
        this.showFieldSuccess(formName, fieldName);
        return true;
    }

    validateForm(formName) {
        const formData = this.forms.get(formName);
        if (!formData) return false;
        
        let isFormValid = true;
        
        formData.fields.forEach((fieldData, fieldName) => {
            if (!this.validateField(formName, fieldName)) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }

    showFieldError(formName, fieldName, message) {
        const formData = this.forms.get(formName);
        const fieldData = formData.fields.get(fieldName);
        
        if (fieldData.errorElement) {
            fieldData.errorElement.textContent = message;
            fieldData.errorElement.style.display = 'block';
        }
        
        fieldData.element.parentNode.classList.add('error');
        
        // Add shake animation
        fieldData.element.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            fieldData.element.style.animation = '';
        }, 500);
    }

    clearFieldError(formName, fieldName) {
        const formData = this.forms.get(formName);
        const fieldData = formData.fields.get(fieldName);
        
        if (fieldData.errorElement) {
            fieldData.errorElement.style.display = 'none';
        }
        
        fieldData.element.parentNode.classList.remove('error');
    }

    showFieldSuccess(formName, fieldName) {
        const formData = this.forms.get(formName);
        const fieldData = formData.fields.get(fieldName);
        
        fieldData.element.parentNode.classList.add('success');
        
        // Remove success class after a delay
        setTimeout(() => {
            fieldData.element.parentNode.classList.remove('success');
        }, 2000);
    }

    async handleFormSubmit(formName) {
        const formData = this.forms.get(formName);
        if (!formData || this.currentSubmission) return;

        if (!this.validateForm(formName)) {
            this.showFormError('Please correct the errors above before submitting.');
            return;
        }

        const payload = this.collectFormData(formName);
        const endpoint = formData.endpoint || formData.element.action || '/api/contact';

        this.currentSubmission = formName;
        this.showLoadingState(formName);

        const ac = new AbortController();
        const t = setTimeout(() => ac.abort(), 10000); // 10s timeout

        try {
            const res = await fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
            signal: ac.signal
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`);

            this.showSuccessState(formName);
            formData.onSuccess(json);
        } catch (err) {
            this.showErrorState(formName, err.message || 'Network error');
            formData.onError(err);
        } finally {
            clearTimeout(t);
            this.currentSubmission = null;
            this.hideLoadingState(formName);
        }
    }


    collectFormData(formName) {
        const formData = this.forms.get(formName);
        const data = {};
        
        formData.fields.forEach((fieldData, fieldName) => {
            data[fieldName] = fieldData.element.value;
        });
        
        return data;
    }

    async submitFormData(endpoint, data) {
        console.log('POSTing to', endpoint, data); // debug
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
            throw new Error(json.error || `HTTP ${res.status}`);
        }
        return json; // { success: true, message: "..." }
    }

    showLoadingState(formName) {
        const formData = this.forms.get(formName);
        const submitButton = formData.submitButton;
        
        if (submitButton) {
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            
            const btnText = submitButton.querySelector('.btn-text');
            const btnLoading = submitButton.querySelector('.btn-loading');
            
            if (btnText && btnLoading) {
                btnText.style.display = 'none';
                btnLoading.style.display = 'flex';
            }
        }
    }

    hideLoadingState(formName) {
        const formData = this.forms.get(formName);
        const submitButton = formData.submitButton;
        
        if (submitButton) {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            
            const btnText = submitButton.querySelector('.btn-text');
            const btnLoading = submitButton.querySelector('.btn-loading');
            
            if (btnText && btnLoading) {
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
            }
        }
    }

    showSuccessState(formName) {
        const formData = this.forms.get(formName);
        
        if (formData.successElement) {
            formData.successElement.classList.add('show');
            
            // Hide after 5 seconds
            setTimeout(() => {
                formData.successElement.classList.remove('show');
            }, 5000);
        }
        
        // Reset form
        this.resetForm(formName);
    }

    showErrorState(formName, message) {
        this.showFormError(message);
    }

    showFormError(message) {
        // Create or update error message element
        let errorElement = document.querySelector('.form-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.style.cssText = `
                background: #e74c3c;
                color: white;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
                text-align: center;
                animation: slideDown 0.3s ease;
            `;
            
            const form = document.querySelector('.contact-form');
            if (form) {
                form.insertBefore(errorElement, form.firstChild);
            }
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    resetForm(formName) {
        const formData = this.forms.get(formName);
        
        // Reset all fields
        formData.fields.forEach((fieldData, fieldName) => {
            fieldData.element.value = '';
            fieldData.isValid = false;
            fieldData.touched = false;
            this.clearFieldError(formName, fieldName);
            fieldData.element.parentNode.classList.remove('focused', 'has-value');
        });
        
        // Reset form element
        formData.element.reset();
    }

    handleContactSuccess(response) {
        // Additional success handling for contact form
        console.log('Contact form submitted successfully:', response);
        
        // Could trigger analytics events, show additional UI, etc.
        this.triggerSuccessAnimation();
    }

    handleContactError(error) {
        // Additional error handling for contact form
        console.error('Contact form submission error:', error);
        
        // Could trigger error analytics, show retry options, etc.
    }

    triggerSuccessAnimation() {
        // Add success animation to the page
        const successIcon = document.createElement('div');
        successIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        successIcon.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            color: #2ecc71;
            z-index: 10000;
            animation: successPulse 1s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(successIcon);
        
        setTimeout(() => {
            document.body.removeChild(successIcon);
        }, 1000);
    }

    // Public methods for external use
    validateFormField(formName, fieldName) {
        return this.validateField(formName, fieldName);
    }

    resetFormData(formName) {
        this.resetForm(formName);
    }

    isFormValid(formName) {
        return this.validateForm(formName);
    }
}

// Add CSS for form enhancements
const formStyles = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    @keyframes successPulse {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }

    .form-group {
        position: relative;
        transition: all 0.3s ease;
    }

    .form-group.focused label {
        transform: translateY(-20px) scale(0.8);
        color: var(--primary-color);
        transition: all 0.3s ease;
    }

    .form-group.error input,
    .form-group.error select,
    .form-group.error textarea {
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }

    .form-group.success input,
    .form-group.success select,
    .form-group.success textarea {
        border-color: #2ecc71;
        box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
    }

    .form-group label {
        transition: all 0.3s ease;
        pointer-events: none;
    }

    .form-group.has-value label {
        transform: translateY(-20px) scale(0.8);
        color: var(--text-light);
    }

    .btn.loading {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .btn-loading {
        display: none;
        align-items: center;
        gap: 0.5rem;
    }

    .form-error {
        display: none;
        animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
        .form-group input,
        .form-group select,
        .form-group textarea {
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 1.2rem;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .btn {
            padding: 1.2rem 2rem;
            font-size: 1rem;
        }
    }

    /* Enhanced focus states for accessibility */
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.2);
    }

    /* Loading spinner animation */
    .fa-spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .form-success { display: none; }
    .form-success.show { display: block; }
`;

// Inject form styles
const formStyleSheet = document.createElement('style');
formStyleSheet.textContent = formStyles;
document.head.appendChild(formStyleSheet);

// Initialize form controller
document.addEventListener('DOMContentLoaded', () => {
    new FormController();
});
