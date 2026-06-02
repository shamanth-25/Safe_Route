FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN pip install --upgrade pip

EXPOSE 5000

CMD ["bash", "run.sh"]
