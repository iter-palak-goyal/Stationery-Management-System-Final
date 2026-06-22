# base image
FROM eclipse-temurin:17-jdk

# temporary working directory
WORKDIR /app

# copy the jar file to the working directory
COPY target/config-server-1.0-SNAPSHOT.jar app.jar

# expose the port the app runs on
EXPOSE 8888

# run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
