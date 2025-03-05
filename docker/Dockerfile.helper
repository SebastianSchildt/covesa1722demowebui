FROM python:3.12-slim-bookworm


RUN apt update && apt install nano
RUN pip3 install kuksa-client
COPY helper.py ./

CMD [ "/usr/local/bin/python", "helper.py" ]