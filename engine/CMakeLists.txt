cmake_minimum_required(VERSION 3.20)
project(ConcurrencyLabEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Enable compiler warnings
if(MSVC)
    add_compile_options(/W4 /permissive-)
else()
    add_compile_options(-Wall -Wextra -Wpedantic)
endif()

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Main CLI simulation engine executable
add_executable(concurrency_lab_engine
    src/main.cpp
)

# Test suite executable
add_executable(concurrency_lab_tests
    tests/test_all.cpp
)

enable_testing()
add_test(NAME AllEngineTests COMMAND concurrency_lab_tests)
