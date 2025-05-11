FROM golang:1.23
EXPOSE 8080

WORKDIR /app
COPY go.mod go.sum ./

RUN go mod download
RUN go install github.com/air-verse/air@latest

COPY . .

CMD air --build.cmd "go build -o apibin ." --build.bin "./apibin"
