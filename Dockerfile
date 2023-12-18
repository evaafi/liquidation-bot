FROM node:18.18.0 as builder

WORKDIR /usr/src/app

RUN apt update && \ 
    apt-get -y install \
    git \
    gcc \
    curl \ 
    libc-dev \ 
    libudev-dev \
    libclang-dev \ 
    && rm -rf /var/lib/apt/lists/*
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
ENV RUSTFLAGS="-C target-feature=-crt-static"

COPY . .

RUN npm i 

RUN npm run build 
RUN npm prune --production

FROM node:18.18.0
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/build ./dist
CMD [ "node", "dist/index.js" ]