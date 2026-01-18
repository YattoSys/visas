from flask import render_template, request, redirect, url_for, flash, jsonify, session, current_app
from .routes import form
import mercadopago
import requests

@form.route('/form')
def display_form():
    service_price = current_app.config.get('SERVICE_PRICE', 100.00)
    currency = current_app.config.get('PAYMENT_CURRENCY', 'USD')
    recaptcha_site_key = current_app.config.get('RECAPTCHA_SITE_KEY', '')
    return render_template('/form/form.html', 
                         service_price=service_price, 
                         currency=currency,
                         recaptcha_site_key=recaptcha_site_key)

@form.route('/form/create-payment', methods=['POST'])
def create_payment():
    try:
        # Get all form data
        form_data = request.form.to_dict()
        
        # Validate reCAPTCHA
        recaptcha_response = request.form.get('g-recaptcha-response')
        recaptcha_secret = current_app.config.get('RECAPTCHA_SECRET_KEY')
        
        if recaptcha_secret and recaptcha_secret != 'TU_SECRET_KEY_AQUI':
            if not recaptcha_response:
                return jsonify({'error': 'Por favor, completa la verificación de seguridad (reCAPTCHA).'}), 400
            
            # Verify reCAPTCHA with Google
            try:
                verify_url = 'https://www.google.com/recaptcha/api/siteverify'
                verify_data = {
                    'secret': recaptcha_secret,
                    'response': recaptcha_response,
                    'remoteip': request.remote_addr
                }
                
                verify_response = requests.post(verify_url, data=verify_data, timeout=5)
                verify_response.raise_for_status()  # Raise an exception for bad status codes
                verify_result = verify_response.json()
                
                if not verify_result.get('success', False):
                    error_codes = verify_result.get('error-codes', [])
                    current_app.logger.warning(f"reCAPTCHA verification failed: {error_codes}")
                    return jsonify({'error': 'La verificación de seguridad falló. Por favor inténtalo nuevamente.'}), 400
            except requests.exceptions.RequestException as e:
                current_app.logger.error(f"Error verifying reCAPTCHA: {str(e)}")
                return jsonify({'error': 'Error al verificar la seguridad. Por favor inténtalo nuevamente.'}), 500
            except ValueError as e:
                current_app.logger.error(f"Error parsing reCAPTCHA response: {str(e)}")
                return jsonify({'error': 'Error al procesar la verificación de seguridad.'}), 500
        else:
            # If reCAPTCHA is not configured, log a warning but allow the request
            current_app.logger.warning('reCAPTCHA no configurado. Saltando validación.')
        
        # Store form data in session for later use
        session['form_data'] = form_data
        
        # Get Mercado Pago configuration
        access_token = current_app.config.get('MERCADOPAGO_ACCESS_TOKEN')
        service_price = current_app.config.get('SERVICE_PRICE', 100.00)
        currency = current_app.config.get('PAYMENT_CURRENCY', 'USD')
        
        if not access_token or access_token == 'TU_ACCESS_TOKEN_AQUI':
            flash('Error de configuración: Por favor configure las credenciales de Mercado Pago.', 'error')
            return jsonify({'error': 'Mercado Pago no configurado'}), 500
        
        # Initialize Mercado Pago SDK
        sdk = mercadopago.SDK(access_token)
        
        # Get base URL for redirect URLs
        base_url = request.url_root.rstrip('/')
        
        # Get user information from form
        user_name = f"{form_data.get('firstName', '')} {form_data.get('lastName', '')}".strip()
        user_email = form_data.get('email', '')
        
        # Create preference data
        preference_data = {
            "items": [
                {
                    "title": "Formulario DS-160 - Servicio de Llenado Profesional",
                    "description": "Servicio de llenado y revisión profesional del formulario DS-160 para solicitud de visa",
                    "quantity": 1,
                    "unit_price": float(service_price),
                    "currency_id": currency
                }
            ],
            "payer": {
                "name": user_name if user_name else "Usuario",
                "email": user_email if user_email else "usuario@ejemplo.com"
            },
            "back_urls": {
                "success": f"{base_url}/form/payment/success",
                "failure": f"{base_url}/form/payment/failure",
                "pending": f"{base_url}/form/payment/pending"
            },
            "auto_return": "approved",
            "notification_url": f"{base_url}/form/payment/webhook",  # Webhook para notificaciones
            "external_reference": f"visa_form_{user_email}_{form_data.get('passportNumber', '')}",
            "statement_descriptor": "TENERVISA FORM DS-160"
        }
        
        # Create preference
        try:
            preference_response = sdk.preference().create(preference_data)
        except Exception as mp_error:
            current_app.logger.error(f"Mercado Pago SDK error: {str(mp_error)}")
            return jsonify({'error': f'Error al comunicarse con Mercado Pago: {str(mp_error)}'}), 500
        
        # Check if response is valid
        if not preference_response or 'status' not in preference_response:
            current_app.logger.error(f"Invalid response from Mercado Pago: {preference_response}")
            return jsonify({'error': 'Respuesta inválida de Mercado Pago'}), 500
        
        if preference_response['status'] in [200, 201]:
            preference = preference_response.get('response', {})
            preference_id = preference.get('id')
            init_point = preference.get('init_point')
            
            if not preference_id:
                current_app.logger.error(f"No preference ID in response: {preference}")
                return jsonify({'error': 'No se pudo obtener el ID de preferencia de Mercado Pago'}), 500
            
            # Store preference ID in session
            session['preference_id'] = preference_id
            
            return jsonify({
                'success': True,
                'preference_id': preference_id,
                'init_point': init_point,
                'sandbox_init_point': preference.get('sandbox_init_point')
            }), 200
        else:
            error_message = preference_response.get('response', {}).get('message', 'Error desconocido')
            current_app.logger.error(f"Mercado Pago error: Status {preference_response['status']}, Message: {error_message}")
            return jsonify({'error': f'Error al crear preferencia: {error_message}'}), 400
            
    except Exception as e:
        current_app.logger.error(f"Error creating payment preference: {str(e)}", exc_info=True)
        # Ensure we always return JSON, even on unexpected errors
        return jsonify({'error': f'Error al procesar el pago: {str(e)}'}), 500

@form.route('/form/payment/success')
def payment_success():
    """Handle successful payment redirect from Mercado Pago"""
    payment_id = request.args.get('payment_id')
    status = request.args.get('status')
    preference_id = request.args.get('preference_id')
    
    # Get form data from session
    form_data = session.get('form_data', {})
    
    # Here you would typically:
    # 1. Verify the payment with Mercado Pago API
    # 2. Save form data and payment info to database
    # 3. Send confirmation email to user
    # 4. Process the visa form application
    
    flash('¡Pago realizado exitosamente! Su solicitud de visa está siendo procesada.', 'success')
    return render_template('/form/payment_success.html', 
                         payment_id=payment_id, 
                         status=status,
                         form_data=form_data)

@form.route('/form/payment/failure')
def payment_failure():
    """Handle failed payment redirect from Mercado Pago"""
    payment_id = request.args.get('payment_id')
    status = request.args.get('status')
    
    flash('El pago no pudo ser procesado. Por favor intente nuevamente o contacte a soporte.', 'error')
    return render_template('/form/payment_failure.html', 
                         payment_id=payment_id, 
                         status=status)

@form.route('/form/payment/pending')
def payment_pending():
    """Handle pending payment redirect from Mercado Pago"""
    payment_id = request.args.get('payment_id')
    status = request.args.get('status')
    
    flash('Su pago está siendo procesado. Recibirá una confirmación cuando se complete.', 'info')
    return render_template('/form/payment_pending.html', 
                         payment_id=payment_id, 
                         status=status)

@form.route('/form/payment/webhook', methods=['POST'])
def payment_webhook():
    """Handle payment notifications from Mercado Pago"""
    try:
        data = request.get_json()
        payment_id = data.get('data', {}).get('id')
        
        if payment_id:
            # Get Mercado Pago access token
            access_token = current_app.config.get('MERCADOPAGO_ACCESS_TOKEN')
            if access_token and access_token != 'TU_ACCESS_TOKEN_AQUI':
                sdk = mercadopago.SDK(access_token)
                payment_info = sdk.payment().get(payment_id)
                
                # Here you would typically:
                # 1. Verify payment status
                # 2. Update your database
                # 3. Send notifications
                # 4. Process the application based on payment status
                
                current_app.logger.info(f"Payment notification received: {payment_id} - Status: {payment_info.get('response', {}).get('status')}")
        
        return jsonify({'status': 'ok'}), 200
    except Exception as e:
        current_app.logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({'error': str(e)}), 500