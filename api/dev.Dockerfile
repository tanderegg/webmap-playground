FROM python:3.13

WORKDIR /api

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY src ./src

ENV FLASK_APP /api/src/api.py
ENV FLASK_ENV development

CMD [ "python", "-m", "flask", "--debug", "run", "--host=0.0.0.0"]

