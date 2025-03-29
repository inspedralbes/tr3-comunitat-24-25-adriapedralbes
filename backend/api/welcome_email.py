from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.conf import settings

def send_welcome_email(subscriber):
    """
    Envía un email de bienvenida después de la confirmación.
    """
    subject = "Las Sorpresas de Adrià Estévez"
    
    # URL del PDF
    pdf_url = f"{settings.SITE_URL}/Te doy la bienvenida y te cuento algo rápido.pdf"
    
    # Contenido HTML
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Bienvenida</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 650px;
            }}
            p {{
                font-size: 16px;
                margin-bottom: 24px;
            }}
            .red {{
                color: #ff0000;
            }}
            .bold {{
                font-weight: bold;
            }}
            .centered {{
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <p>Te doy la bienvenida y te cuento algo rápido.</p>
        
        <p>Después de muchos trabajos documentados de éxito automatizando procesos para todo tipo de empresas, varios sistemas que han transformado por completo negocios estancados y visitas a diferentes países del mundo para hablar de todo esto...</p>
        
        <p>...he observado dos tendencias que requieren atención inmediata:</p>
        
        <p class="bold">-1 El mundo de la tecnología está lleno de gente que complica lo simple.</p>
        
        <p>Me explico:</p>
        
        <p>NO vendo formación donde te digo, "compra este curso de IA y hazte rico mientras duermes".</p>
        
        <p>Soy especialista en automatización con IA, implemento una tecnología que está revolucionando el mundo y tú debes ser un profesional de lo que sea, para poder aplicarla y multiplicar tu productividad. Es muy distinto.</p>
        
        <p>Esta tecnología (automatización con IA) te puede ayudar una barbaridad.</p>
        
        <p>Conmigo automatizan sus procesos emprendedores, directivos, creativos, profesionales del marketing, empresarios, médicos, abogados, psicólogos, profesores, comerciales, consultores, coaches, diseñadores, arquitectos, programadores, etc, etc</p>
        
        <p class="bold">-2 Con todo el ruido tecnológico que hay ahí fuera, es muy difícil tomar buenas decisiones.</p>
        
        <p>Todo lo que implemento es fruto de mi propia experiencia.</p>
        
        <p>No toco de oídas.</p>
        
        <p>He creado (y sigo creando) muchas automatizaciones documentadas con resultados reales y medibles.</p>
        
        <p>Te recomiendo que aprendas sobre IA, en esta nueva era digital, con alguien que ensucia sus manos con código, no con un teórico de PowerPoint.</p>
        
        <p>Así que te mandaré un email diario gratuito con una única intención, que descubras cómo la automatización con IA puede transformar tu vida.</p>
        
        <p>Si aprendes y dominas esto, tu negocio, sea grande o pequeño, será mucho más eficiente, rentable y te dará la libertad que siempre has buscado.</p>
        
        <p>Todos estos recursos, son gratuitos. Empieza por ellos, con calma, no hay prisa, libérate de tareas repetitivas poco a poco.</p>
        
        <p><a href="{pdf_url}" class="red">Aquí</a> tienes el PDF prometido con los tres pilares de la automatización.</p>
                
        <p>Es la historia de un "vago inteligente" que me enseñó, sin pretenderlo, algo fundamental que todo profesional debe conocer. Aplícalo y verás los resultados.</p>
        
        <p>Lo escribí hace poco pero te aseguro que seguirá siendo válido dentro de 10 años, cuando todos intenten subirse al carro de la IA.</p>
        
        <p>Y lo dicho, disfruta por aquí, somos miles de personas transformando la manera de trabajar.</p>
        
        <p>Pasa un gran día.<br>
        Adrià Estévez</p>
    </body>
    </html>
    """
    
    # Versión texto plano
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject=subject,
        message=plain_message,
        html_message=html_message,
        from_email='Adrià Estévez <adria@futurprive.com>',
        recipient_list=[subscriber.email],
        fail_silently=False,
    )
