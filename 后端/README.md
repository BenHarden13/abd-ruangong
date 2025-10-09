# Diet Hub Backend

A Spring Boot application for managing health profiles and recipes for the Diet Hub system.

## Java Version

This project requires **Java 21** (LTS).

## Technology Stack

- Java 21
- Spring Boot 3.3.5
- Spring Data JPA
- H2 Database (in-memory)
- Lombok
- Maven

## Prerequisites

- JDK 21 or higher
- Maven 3.6+

## Building the Project

```bash
mvn clean package
```

## Running the Application

### Option 1: Using Maven
```bash
mvn spring-boot:run
```

### Option 2: Using JAR file
```bash
java -jar target/hub-1.0.0.jar
```

### Option 3: Using Start Script (Windows)
```bash
start-backend.bat
```

## API Endpoints

### Health Check
- `GET /health-check` - Check if the service is running
- `GET /ping` - Simple connectivity test

### Health Profiles
- `POST /api/health-profiles` - Create or update a health profile
- `GET /api/health-profiles/user/{userId}` - Get profile by user ID
- `GET /api/health-profiles` - Get all profiles
- `DELETE /api/health-profiles/{id}` - Delete a profile

### Recipes
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/{id}` - Get recipe by ID
- `GET /api/recipes/category/{category}` - Get recipes by category
- `GET /api/recipes/search?keyword={keyword}` - Search recipes
- `GET /api/recipes/calories?min={min}&max={max}` - Get recipes by calorie range
- `PUT /api/recipes/{id}` - Update a recipe
- `DELETE /api/recipes/{id}` - Delete a recipe

## Database

The application uses H2 in-memory database. The database is initialized with sample recipe data on startup.

### H2 Console
Access the H2 console at: http://localhost:8080/h2-console

- **JDBC URL:** jdbc:h2:mem:diethub
- **Username:** sa
- **Password:** (leave empty)

## Configuration

Application configuration can be modified in `src/main/resources/application.properties`:

- Server port: `server.port=8080`
- Database settings
- JPA/Hibernate settings
- CORS configuration

## Sample Health Profile Request

```json
{
  "userId": "user123",
  "age": 30,
  "gender": "Male",
  "height": 175.0,
  "weight": 70.0,
  "activityLevel": "Moderate",
  "healthGoal": "Weight Loss",
  "dietaryRestrictions": "None",
  "allergies": "None"
}
```

## Project Structure

```
src/
├── main/
│   ├── java/com/diet/hub/
│   │   ├── DietHubApplication.java
│   │   ├── config/
│   │   │   └── DataInitializer.java
│   │   ├── controller/
│   │   │   ├── HealthCheckController.java
│   │   │   ├── HealthProfileController.java
│   │   │   └── RecipeController.java
│   │   ├── dto/
│   │   │   ├── HealthProfileRequestDto.java
│   │   │   └── HealthProfileResponseDto.java
│   │   ├── entity/
│   │   │   ├── HealthProfile.java
│   │   │   ├── HealthRecord.java
│   │   │   └── Recipe.java
│   │   ├── repository/
│   │   │   ├── HealthProfileRepository.java
│   │   │   └── RecipeRepository.java
│   │   └── service/
│   │       ├── HealthProfileService.java
│   │       └── RecipeService.java
│   └── resources/
│       └── application.properties
```

## License

This project is for educational purposes.
