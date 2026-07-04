# ─── Build 
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw package -DskipTests -B

# ─── Run 
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/quarkus-app /app

EXPOSE 8080

CMD ["java", "-jar", "quarkus-run.jar"]
