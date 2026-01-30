#pragma once

#include <string>
#include <vector>
#include <optional>
#include <nlohmann/json.hpp>

namespace vicrow {

using json = nlohmann::json;

/**
 * @brief User model representing database user entity
 */
struct User {
    int id;
    std::string email;
    std::optional<std::string> name;
    std::string createdAt;
    std::string updatedAt;

    json to_json() const {
        json j;
        j["id"] = id;
        j["email"] = email;
        j["name"] = name.has_value() ? json(name.value()) : json(nullptr);
        j["createdAt"] = createdAt;
        j["updatedAt"] = updatedAt;
        return j;
    }

    static User from_json(const json& j) {
        User user;
        user.id = j.value("id", 0);
        user.email = j.value("email", "");
        if (j.contains("name") && !j["name"].is_null()) {
            user.name = j["name"].get<std::string>();
        }
        user.createdAt = j.value("createdAt", "");
        user.updatedAt = j.value("updatedAt", "");
        return user;
    }
};

/**
 * @brief DTO for creating a new user
 */
struct CreateUserDto {
    std::string email;
    std::optional<std::string> name;

    static CreateUserDto from_json(const json& j) {
        CreateUserDto dto;
        dto.email = j.value("email", "");
        if (j.contains("name") && !j["name"].is_null()) {
            dto.name = j["name"].get<std::string>();
        }
        return dto;
    }
};

/**
 * @brief DTO for updating a user
 */
struct UpdateUserDto {
    std::optional<std::string> email;
    std::optional<std::string> name;

    static UpdateUserDto from_json(const json& j) {
        UpdateUserDto dto;
        if (j.contains("email") && !j["email"].is_null()) {
            dto.email = j["email"].get<std::string>();
        }
        if (j.contains("name") && !j["name"].is_null()) {
            dto.name = j["name"].get<std::string>();
        }
        return dto;
    }
};

} // namespace vicrow
