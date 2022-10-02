FROM debian

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    python-is-python3 \
    curl \
    git

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs \
    build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    node --version && \ 
    npm --version && \
    npm install --global yarn

WORKDIR /app
COPY . .

RUN bash install_dependencies.sh

RUN python -m pip install numpy
RUN python -m pip install aeneas
RUN python -m pip install mutagen
RUN python -m pip install html5lib

RUN yarn
CMD ["yarn", "dev"]

ENV PORT=3000

EXPOSE 3000