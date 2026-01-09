from flask import render_template, request, redirect, url_for, flash, jsonify
from .routes import form

@form.route('/form')
def display_form():
    return render_template('/form/form.html')

@form.route('/form/submit', methods=['POST'])
def submit_form():
    try:
        # Get all form data
        form_data = request.form.to_dict()
        
        # Process form data here
        # You can save to database, send emails, etc.
        
        # For now, just flash a success message
        flash('¡Su solicitud de visa ha sido enviada exitosamente!', 'success')
        
        # Redirect to a success page or back to form
        return redirect(url_for('form.display_form'))
        
    except Exception as e:
        flash(f'Error al procesar la solicitud: {str(e)}', 'error')
        return redirect(url_for('form.display_form'))