FROM node:14-alpine

# Create app directory
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ENV PORT=80
ENV DB=mongodb+srv://duonglt:300601@dsvinternship.pjj2z.mongodb.net/dsv_intern
ENV NODE_ENV=development
ENV JWT_SECRET=8ca125b6e94b0b6d22e002da065f79bfa1fe908c50c359c939b9ef20555bb14dc496927eb9f9bc597e58fec6a4c5a787
ENV EMAIL_USER=dualblog.noreply@gmail.com
ENV EMAIL_PASS=yuosgxfvdaudfxni
ENV SERVER_URL=https://duonglt.api.internship.designveloper.com
ENV CLIENT_URL=https://duonglt.internship.designveloper.com
# ENV SERVER_URL=http://localhost:5000
# ENV CLIENT_URL=http://localhost:3000

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json /usr/src/app/

RUN npm install

# If you are building your code for production
RUN npm ci --only=production
RUN npm i --save-dev @types/express

# Bundle app source
COPY . /usr/src/app

EXPOSE 80

CMD [ "npm", "start" ]