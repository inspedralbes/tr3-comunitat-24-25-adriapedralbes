
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        # Asegurar que la columna avatar_url_external existe
        migrations.RunSQL(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='api_user' AND column_name='avatar_url_external'
                ) THEN
                    ALTER TABLE api_user ADD COLUMN avatar_url_external varchar(500) NULL;
                END IF;
            END $$;
            """,
            reverse_sql=""
        ),
    ]
