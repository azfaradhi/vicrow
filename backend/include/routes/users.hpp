#pragma once

#include <crow.h>
#include "services/prisma_client.hpp"
#include "models/user.hpp"

namespace vicrow {
namespace routes {

/**
 * @brief Register user CRUD routes
 */
template<typename App>
void registerUserRoutes(App& app, PrismaClient& prisma) {
    // GET /api/users - Get all users
    CROW_ROUTE(app, "/api/users")
    ([&prisma]() -> crow::response {
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
            
            crow::response res(crow::json::wvalue(userList));
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
    ([&prisma](int id) -> crow::response {
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
            
            crow::response res(u);
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
    ([&prisma](const crow::request& req) -> crow::response {
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
    ([&prisma](const crow::request& req, int id) -> crow::response {
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
            
            crow::response res(u);
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
    ([&prisma](int id) -> crow::response {
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
            
            crow::response res(success);
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
}

} // namespace routes
} // namespace vicrow
