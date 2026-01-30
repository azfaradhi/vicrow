#include <iostream>
#include <csignal>
#include <crow.h>

#include "services/prisma_client.hpp"
#include "middleware/cors.hpp"
#include "models/user.hpp"

using namespace vicrow;

// Global flag for graceful shutdown
volatile bool running = true;

void signalHandler(int signum) {
    std::cout << "\nReceived signal " << signum << ", shutting down..." << std::endl;
    running = false;
}

int main() {
    // Setup signal handlers
    std::signal(SIGINT, signalHandler);
    std::signal(SIGTERM, signalHandler);

    // Print startup banner
    std::cout << R"(
 __      ___                        
 \ \    / (_)                       
  \ \  / / _  ___ _ __ _____      __
   \ \/ / | |/ __| '__/ _ \ \ /\ / /
    \  /  | | (__| | | (_) \ V  V / 
     \/   |_|\___|_|  \___/ \_/\_/  
                                    
    Vite + Crow Backend Framework
    )" << std::endl;

    // Initialize Prisma client
    PrismaClient prisma;
    prisma.setServiceUrl("http://localhost:3001");
    
    std::cout << "Connecting to Prisma service..." << std::endl;
    if (prisma.connect()) {
        std::cout << "✓ Connected to Prisma service" << std::endl;
    } else {
        std::cout << "⚠ Could not connect to Prisma service. Start it with: npm run prisma:serve" << std::endl;
    }

    // Create Crow app with CORS middleware
    crow::App<CORSMiddleware> app;

    // Health check route
    CROW_ROUTE(app, "/api/health")
    ([&prisma]() {
        crow::json::wvalue response;
        response["status"] = "ok";
        response["message"] = "Vicrow Backend is running";
        response["timestamp"] = std::to_string(std::time(nullptr));
        response["database"] = prisma.isConnected() ? "connected" : "disconnected";
        
        crow::response res{response};
        res.add_header("Content-Type", "application/json");
        return res;
    });

    // GET /api/users - Get all users
    CROW_ROUTE(app, "/api/users")
    ([&prisma]() {
        try {
            auto users = prisma.findManyUsers();
            crow::json::wvalue::list userList;
            
            for (const auto& user : users) {
                crow::json::wvalue u;
                u["id"] = user.id;
                u["email"] = user.email;
                u["name"] = user.name.has_value() ? user.name.value() : "";
                u["createdAt"] = user.createdAt;
                u["updatedAt"] = user.updatedAt;
                userList.push_back(std::move(u));
            }
            
            crow::response res{crow::json::wvalue(userList)};
            res.add_header("Content-Type", "application/json");
            return res;
        } catch (const std::exception& e) {
            crow::json::wvalue error;
            error["error"] = e.what();
            crow::response res(500, error.dump());
            res.add_header("Content-Type", "application/json");
            return res;
        }
    });

    // GET /api/users/:id - Get user by ID
    CROW_ROUTE(app, "/api/users/<int>")
    ([&prisma](int id) {
        try {
            auto user = prisma.findUserById(id);
            if (!user.has_value()) {
                crow::json::wvalue error;
                error["error"] = "User not found";
                crow::response res(404, error.dump());
                res.add_header("Content-Type", "application/json");
                return res;
            }
            
            crow::json::wvalue u;
            u["id"] = user->id;
            u["email"] = user->email;
            u["name"] = user->name.has_value() ? user->name.value() : "";
            u["createdAt"] = user->createdAt;
            u["updatedAt"] = user->updatedAt;
            
            crow::response res{u};
            res.add_header("Content-Type", "application/json");
            return res;
        } catch (const std::exception& e) {
            crow::json::wvalue error;
            error["error"] = e.what();
            crow::response res(500, error.dump());
            res.add_header("Content-Type", "application/json");
            return res;
        }
    });

    // POST /api/users - Create user
    CROW_ROUTE(app, "/api/users").methods(crow::HTTPMethod::POST)
    ([&prisma](const crow::request& req) {
        try {
            auto body = crow::json::load(req.body);
            if (!body) {
                crow::json::wvalue error;
                error["error"] = "Invalid JSON body";
                crow::response res(400, error.dump());
                res.add_header("Content-Type", "application/json");
                return res;
            }
            
            CreateUserDto dto;
            dto.email = body["email"].s();
            if (body.has("name") && body["name"].t() != crow::json::type::Null) {
                dto.name = body["name"].s();
            }
            
            auto user = prisma.createUser(dto);
            
            crow::json::wvalue u;
            u["id"] = user.id;
            u["email"] = user.email;
            u["name"] = user.name.has_value() ? user.name.value() : "";
            u["createdAt"] = user.createdAt;
            u["updatedAt"] = user.updatedAt;
            
            crow::response res(201, u.dump());
            res.add_header("Content-Type", "application/json");
            return res;
        } catch (const std::exception& e) {
            crow::json::wvalue error;
            error["error"] = e.what();
            crow::response res(500, error.dump());
            res.add_header("Content-Type", "application/json");
            return res;
        }
    });

    // PUT /api/users/:id - Update user
    CROW_ROUTE(app, "/api/users/<int>").methods(crow::HTTPMethod::PUT)
    ([&prisma](const crow::request& req, int id) {
        try {
            auto body = crow::json::load(req.body);
            if (!body) {
                crow::json::wvalue error;
                error["error"] = "Invalid JSON body";
                crow::response res(400, error.dump());
                res.add_header("Content-Type", "application/json");
                return res;
            }
            
            UpdateUserDto dto;
            if (body.has("email") && body["email"].t() != crow::json::type::Null) {
                dto.email = body["email"].s();
            }
            if (body.has("name") && body["name"].t() != crow::json::type::Null) {
                dto.name = body["name"].s();
            }
            
            auto user = prisma.updateUser(id, dto);
            if (!user.has_value()) {
                crow::json::wvalue error;
                error["error"] = "User not found";
                crow::response res(404, error.dump());
                res.add_header("Content-Type", "application/json");
                return res;
            }
            
            crow::json::wvalue u;
            u["id"] = user->id;
            u["email"] = user->email;
            u["name"] = user->name.has_value() ? user->name.value() : "";
            u["createdAt"] = user->createdAt;
            u["updatedAt"] = user->updatedAt;
            
            crow::response res{u};
            res.add_header("Content-Type", "application/json");
            return res;
        } catch (const std::exception& e) {
            crow::json::wvalue error;
            error["error"] = e.what();
            crow::response res(500, error.dump());
            res.add_header("Content-Type", "application/json");
            return res;
        }
    });

    // DELETE /api/users/:id - Delete user
    CROW_ROUTE(app, "/api/users/<int>").methods(crow::HTTPMethod::DELETE)
    ([&prisma](int id) {
        try {
            bool deleted = prisma.deleteUser(id);
            if (!deleted) {
                crow::json::wvalue error;
                error["error"] = "User not found";
                crow::response res(404, error.dump());
                res.add_header("Content-Type", "application/json");
                return res;
            }
            
            crow::json::wvalue success;
            success["message"] = "User deleted successfully";
            
            crow::response res{success};
            res.add_header("Content-Type", "application/json");
            return res;
        } catch (const std::exception& e) {
            crow::json::wvalue error;
            error["error"] = e.what();
            crow::response res(500, error.dump());
            res.add_header("Content-Type", "application/json");
            return res;
        }
    });

    // Configure and start server
    std::cout << "\nStarting server on http://localhost:8080" << std::endl;
    std::cout << "Press Ctrl+C to stop\n" << std::endl;

    app.port(8080)
       .multithreaded()
       .run();

    // Cleanup
    prisma.disconnect();
    std::cout << "Server stopped." << std::endl;

    return 0;
}
