// Form Wizard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('visaForm');
    const steps = document.querySelectorAll('.wizard-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressFill = document.getElementById('progressFill');
    
    let currentStep = 1;
    const totalSteps = steps.length;

    // Initialize
    updateStepDisplay();
    setupEventListeners();
    setupConditionalFields();

    function setupEventListeners() {
        prevBtn.addEventListener('click', goToPreviousStep);
        nextBtn.addEventListener('click', goToNextStep);
        submitBtn.addEventListener('click', handleSubmit);
        
        // Step indicator clicks
        stepIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (index + 1 < currentStep) {
                    goToStep(index + 1);
                }
            });
        });
    }

    function setupConditionalFields() {
        // Lost passport details
        const lostPassportRadios = document.querySelectorAll('input[name="lostPassport"]');
        const lostPassportDetails = document.getElementById('lostPassportDetails');
        
        lostPassportRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'yes') {
                    lostPassportDetails.style.display = 'block';
                } else {
                    lostPassportDetails.style.display = 'none';
                }
            });
        });

        // Previous visit details
        const previousVisitRadios = document.querySelectorAll('input[name="previousVisit"]');
        const previousVisitDetails = document.getElementById('previousVisitDetails');
        
        previousVisitRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'yes') {
                    previousVisitDetails.style.display = 'block';
                } else {
                    previousVisitDetails.style.display = 'none';
                }
            });
        });

        // Spouse info
        const isMarriedRadios = document.querySelectorAll('input[name="isMarried"]');
        const spouseInfo = document.getElementById('spouseInfo');
        const spouseFields = spouseInfo.querySelectorAll('input, select');
        
        isMarriedRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'yes') {
                    spouseInfo.style.display = 'block';
                    spouseFields.forEach(field => field.required = true);
                } else {
                    spouseInfo.style.display = 'none';
                    spouseFields.forEach(field => {
                        field.required = false;
                        field.value = '';
                    });
                }
            });
        });

        // Children info
        const hasChildrenRadios = document.querySelectorAll('input[name="hasChildren"]');
        const childrenInfo = document.getElementById('childrenInfo');
        
        hasChildrenRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'yes') {
                    childrenInfo.style.display = 'block';
                } else {
                    childrenInfo.style.display = 'none';
                }
            });
        });

        // Add child button
        const addChildBtn = document.querySelector('.btn-add-child');
        if (addChildBtn) {
            addChildBtn.addEventListener('click', addChildEntry);
        }

        // Criminal record details
        const criminalRecordRadios = document.querySelectorAll('input[name="criminalRecord"]');
        const criminalRecordDetails = document.getElementById('criminalRecordDetails');
        
        criminalRecordRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'yes') {
                    criminalRecordDetails.style.display = 'block';
                } else {
                    criminalRecordDetails.style.display = 'none';
                }
            });
        });

        // Visa denied details
        const visaDeniedRadios = document.querySelectorAll('input[name="visaDenied"]');
        const visaDeniedDetails = document.getElementById('visaDeniedDetails');
        
        visaDeniedRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'yes') {
                    visaDeniedDetails.style.display = 'block';
                } else {
                    visaDeniedDetails.style.display = 'none';
                }
            });
        });

        // Medical condition details
        const medicalConditionRadios = document.querySelectorAll('input[name="medicalCondition"]');
        const medicalConditionDetails = document.getElementById('medicalConditionDetails');
        
        medicalConditionRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'yes') {
                    medicalConditionDetails.style.display = 'block';
                } else {
                    medicalConditionDetails.style.display = 'none';
                }
            });
        });
    }

    function addChildEntry() {
        const childrenContainer = document.querySelector('.children-container');
        const childCount = childrenContainer.children.length + 1;
        
        const childEntry = document.createElement('div');
        childEntry.className = 'child-entry';
        childEntry.innerHTML = `
            <h4>Hijo(a) ${childCount}</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" name="childFirstName[]">
                </div>
                <div class="form-group">
                    <label>Apellido</label>
                    <input type="text" name="childLastName[]">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input type="date" name="childDateOfBirth[]">
                </div>
                <div class="form-group">
                    <label>Nacionalidad</label>
                    <select name="childNationality[]">
                        <option value="">Seleccione</option>
                        <option value="MX">México</option>
                        <option value="US">Estados Unidos</option>
                        <option value="CA">Canadá</option>
                    </select>
                </div>
            </div>
        `;
        
        childrenContainer.appendChild(childEntry);
    }

    function validateStep(step) {
        const currentStepElement = steps[step - 1];
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#e74c3c';
                
                // Remove error style after user starts typing
                field.addEventListener('input', function() {
                    this.style.borderColor = '#e0e0e0';
                }, { once: true });
            } else {
                field.style.borderColor = '#e0e0e0';
            }
        });

        // Validate email format
        const emailFields = currentStepElement.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !isValidEmail(field.value)) {
                isValid = false;
                field.style.borderColor = '#e74c3c';
                alert('Por favor, ingrese un correo electrónico válido.');
            }
        });

        // Validate date ranges
        if (step === 2) {
            const issueDate = document.getElementById('passportIssueDate').value;
            const expiryDate = document.getElementById('passportExpiryDate').value;
            if (issueDate && expiryDate && new Date(expiryDate) <= new Date(issueDate)) {
                isValid = false;
                alert('La fecha de vencimiento debe ser posterior a la fecha de emisión.');
            }
        }

        if (step === 3) {
            const arrivalDate = document.getElementById('intendedArrivalDate').value;
            const departureDate = document.getElementById('intendedDepartureDate').value;
            if (arrivalDate && departureDate && new Date(departureDate) <= new Date(arrivalDate)) {
                isValid = false;
                alert('La fecha de salida debe ser posterior a la fecha de llegada.');
            }
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function goToStep(step) {
        if (step < 1 || step > totalSteps) return;
        
        currentStep = step;
        updateStepDisplay();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToNextStep() {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepDisplay();
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            alert('Por favor, complete todos los campos requeridos antes de continuar.');
        }
    }

    function goToPreviousStep() {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function updateStepDisplay() {
        // Update steps visibility
        steps.forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update step indicators
        stepIndicators.forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNum === currentStep) {
                indicator.classList.add('active');
            } else if (stepNum < currentStep) {
                indicator.classList.add('completed');
            }
        });

        // Update progress bar
        const progress = (currentStep / totalSteps) * 100;
        progressFill.style.width = progress + '%';

        // Update navigation buttons
        if (currentStep === 1) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
        }

        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
            generateReviewContent();
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }

    function generateReviewContent() {
        const reviewContent = document.getElementById('reviewContent');
        const formData = new FormData(form);
        
        let html = '';
        
        // Step 1: Personal Info
        html += '<div class="review-item"><h4>Información Personal</h4>';
        html += `<p><strong>Nombre:</strong> ${formData.get('firstName')} ${formData.get('middleName') || ''} ${formData.get('lastName')}</p>`;
        html += `<p><strong>Fecha de Nacimiento:</strong> ${formData.get('dateOfBirth')}</p>`;
        html += `<p><strong>Lugar de Nacimiento:</strong> ${formData.get('placeOfBirth')}, ${formData.get('countryOfBirth')}</p>`;
        html += `<p><strong>Nacionalidad:</strong> ${formData.get('nationality')}</p>`;
        html += `<p><strong>Género:</strong> ${formData.get('gender')}</p>`;
        html += `<p><strong>Estado Civil:</strong> ${formData.get('maritalStatus')}</p>`;
        html += '</div>';

        // Step 2: Passport Info
        html += '<div class="review-item"><h4>Información de Pasaporte</h4>';
        html += `<p><strong>Número de Pasaporte:</strong> ${formData.get('passportNumber')}</p>`;
        html += `<p><strong>País Emisor:</strong> ${formData.get('passportIssuingCountry')}</p>`;
        html += `<p><strong>Fecha de Emisión:</strong> ${formData.get('passportIssueDate')}</p>`;
        html += `<p><strong>Fecha de Vencimiento:</strong> ${formData.get('passportExpiryDate')}</p>`;
        html += `<p><strong>Ciudad de Emisión:</strong> ${formData.get('passportCityOfIssue')}</p>`;
        html += '</div>';

        // Step 3: Travel Info
        html += '<div class="review-item"><h4>Información de Viaje</h4>';
        html += `<p><strong>Propósito:</strong> ${formData.get('travelPurpose')}</p>`;
        html += `<p><strong>Fecha de Llegada:</strong> ${formData.get('intendedArrivalDate')}</p>`;
        html += `<p><strong>Fecha de Salida:</strong> ${formData.get('intendedDepartureDate')}</p>`;
        html += `<p><strong>Duración:</strong> ${formData.get('durationOfStay')} días</p>`;
        html += `<p><strong>Destino:</strong> ${formData.get('destinationCity')}, ${formData.get('destinationCountry')}</p>`;
        html += '</div>';

        // Step 4: Contact Info
        html += '<div class="review-item"><h4>Información de Contacto</h4>';
        html += `<p><strong>Dirección:</strong> ${formData.get('currentAddress')}</p>`;
        html += `<p><strong>Ciudad:</strong> ${formData.get('currentCity')}, ${formData.get('currentState')}</p>`;
        html += `<p><strong>Código Postal:</strong> ${formData.get('currentPostalCode')}</p>`;
        html += `<p><strong>Teléfono:</strong> ${formData.get('phoneNumber')}</p>`;
        html += `<p><strong>Email:</strong> ${formData.get('email')}</p>`;
        html += `<p><strong>Contacto de Emergencia:</strong> ${formData.get('emergencyContactName')} (${formData.get('emergencyContactRelationship')})</p>`;
        html += '</div>';

        // Step 5: Family Info
        html += '<div class="review-item"><h4>Información Familiar</h4>';
        if (formData.get('isMarried') === 'yes') {
            html += `<p><strong>Cónyuge:</strong> ${formData.get('spouseFirstName')} ${formData.get('spouseLastName')}</p>`;
        }
        html += `<p><strong>Padre:</strong> ${formData.get('fatherFirstName')} ${formData.get('fatherLastName')}</p>`;
        html += `<p><strong>Madre:</strong> ${formData.get('motherFirstName')} ${formData.get('motherLastName')}</p>`;
        html += '</div>';

        // Step 6: Employment/Education
        html += '<div class="review-item"><h4>Empleo y Educación</h4>';
        html += `<p><strong>Ocupación:</strong> ${formData.get('occupation')}</p>`;
        html += `<p><strong>Empleador:</strong> ${formData.get('employerName')}</p>`;
        html += `<p><strong>Nivel de Educación:</strong> ${formData.get('educationLevel')}</p>`;
        html += '</div>';

        // Step 7: Security
        html += '<div class="review-item"><h4>Información de Seguridad</h4>';
        html += `<p><strong>Antecedentes Penales:</strong> ${formData.get('criminalRecord')}</p>`;
        html += `<p><strong>Visa Rechazada:</strong> ${formData.get('visaDenied')}</p>`;
        html += `<p><strong>Condición Médica:</strong> ${formData.get('medicalCondition')}</p>`;
        html += '</div>';

        reviewContent.innerHTML = html;
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        if (!validateStep(currentStep)) {
            alert('Por favor, complete todos los campos requeridos antes de continuar.');
            return;
        }

        // Check confirmations
        const confirmAccuracy = document.getElementById('confirmAccuracy');
        const confirmTerms = document.getElementById('confirmTerms');
        
        if (!confirmAccuracy.checked || !confirmTerms.checked) {
            alert('Por favor, confirme que toda la información es precisa y acepte los términos y condiciones.');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';

        // Create payment preference
        createPaymentPreference();
    }

    function createPaymentPreference() {
        // Create FormData directly from form
        const formData = new FormData(form);
        
        // Handle array fields (children) properly
        const childEntries = form.querySelectorAll('[name^="child"]');
        childEntries.forEach((input, index) => {
            const name = input.name.replace('[]', '');
            formData.append(name, input.value);
        });

        // Send request to create payment preference
        fetch('/form/create-payment', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show payment section
                const paymentSection = document.getElementById('paymentSection');
                paymentSection.style.display = 'block';
                
                // Hide submit button and show payment button
                submitBtn.style.display = 'none';
                
                // Redirect to Mercado Pago checkout
                const initPoint = data.init_point || data.sandbox_init_point;
                if (initPoint) {
                    // Create Mercado Pago button
                    createMercadoPagoButton(initPoint);
                    
                    // Scroll to payment section
                    paymentSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    alert('Error: No se pudo obtener la URL de pago. Por favor intente nuevamente.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Proceder al Pago';
                }
            } else {
                alert('Error al crear la preferencia de pago: ' + (data.error || 'Error desconocido'));
                submitBtn.disabled = false;
                submitBtn.textContent = 'Proceder al Pago';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al procesar el pago. Por favor intente nuevamente.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Proceder al Pago';
        });
    }

    function createMercadoPagoButton(initPoint) {
        const mercadoPagoContainer = document.getElementById('mercadoPagoButton');
        
        // Create button
        const payButton = document.createElement('a');
        payButton.href = initPoint;
        payButton.className = 'btn-mercado-pago';
        payButton.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0z" fill="#009EE3"/>
                <path d="M20 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z" fill="white"/>
                <path d="M20 10c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10z" fill="#009EE3"/>
            </svg>
            <span>Pagar con Mercado Pago</span>
        `;
        
        mercadoPagoContainer.innerHTML = '';
        mercadoPagoContainer.appendChild(payButton);
    }
});
