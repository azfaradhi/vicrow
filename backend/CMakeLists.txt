cmake_minimum_required(VERSION 3.14)
project(vicrow_backend VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Find required packages
find_package(Threads REQUIRED)

# Crow is header-only, we'll fetch it
include(FetchContent)

FetchContent_Declare(
    Crow
    GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
    GIT_TAG v1.0+5
)

FetchContent_Declare(
    nlohmann_json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.11.3
)

FetchContent_MakeAvailable(Crow nlohmann_json)

# Source files
set(SOURCES
    src/main.cpp
    src/routes/health.cpp
    src/routes/users.cpp
    src/services/prisma_client.cpp
    src/middleware/cors.cpp
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# Link libraries
target_link_libraries(${PROJECT_NAME} PRIVATE
    Crow::Crow
    nlohmann_json::nlohmann_json
    Threads::Threads
)

# Copy prisma binary helper script
configure_file(
    ${CMAKE_CURRENT_SOURCE_DIR}/scripts/prisma_query.sh
    ${CMAKE_CURRENT_BINARY_DIR}/prisma_query.sh
    COPYONLY
)

# Install target
install(TARGETS ${PROJECT_NAME} DESTINATION bin)
