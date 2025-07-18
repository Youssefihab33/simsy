FROM python:3.13-slim AS django_build

WORKDIR /usr/src/app/simsy

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY ./simsy/requirements.txt ./
RUN pip install --no-cache-dir -r ./requirements.txt gunicorn

COPY ./simsy/ .

RUN python manage.py collectstatic --noinput

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=django_build /usr/local /usr/local

COPY --from=django_build /usr/src/app/simsy /usr/src/app/simsy

WORKDIR /usr/src/app/simsy

RUN rm -f /etc/nginx/sites-enabled/default
COPY ./nginx.conf /etc/nginx/sites-available/simsy.conf
RUN ln -s /etc/nginx/sites-available/simsy.conf /etc/nginx/sites-enabled/simsy.conf

COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]