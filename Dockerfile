FROM node:18.18.0 as builder

RUN apt update && \ 
    apt-get -y install \
    git \
    gcc \
    curl \ 
    musl-dev \
    libc-dev \ 
    libudev-dev \
    libclang-dev \ 
    && rm -rf /var/lib/apt/lists/*
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn --frozen-lockfile 

COPY . .

RUN yarn build 
RUN npm prune --production

FROM node:18.18.0-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/build ./dist
CMD [ "node", "dist/index.js" ]