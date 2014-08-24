# Import Form and RecaptchaField (optional)
from flask.ext.wtf import Form # , RecaptchaField

# Import Form elements such as TextField and BooleanField (optional)
from wtforms import TextField, PasswordField # BooleanField

# Import Form validators
from wtforms.validators import Required, Email, EqualTo


# Define the login form (WTForms)

class Filterform(Form):
    xxx    = TextField('Email Address', [Email(),
                Required(message='Forgot your email address?')])
    xxxxx = PasswordField('Password', [
                Required(message='Must provide a password. ;-)')])
