#include "services/prisma_client.hpp"
#include <array>
#include <memory>
#include <stdexcept>
#include <cstdio>
#include <sstream>
#include <iostream>
#include <fstream>

namespace vicrow {

PrismaClient::PrismaClient() 
    : serviceUrl_("http://localhost:3001")
    , connected_(false) 
{
}

PrismaClient::~PrismaClient() {
    disconnect();
}

bool PrismaClient::isConnected() const {
    return connected_;
}

bool PrismaClient::connect() {
    try {
        // Try to connect to Prisma service
        auto result = executeQuery("/health");
        connected_ = (result.contains("status") && result["status"] == "ok");
        return connected_;
    } catch (...) {
        connected_ = false;
        return false;
    }
}

void PrismaClient::disconnect() {
    connected_ = false;
}

std::string PrismaClient::executeCommand(const std::string& command) {
    std::array<char, 128> buffer;
    std::string result;
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(command.c_str(), "r"), pclose);
    
    if (!pipe) {
        throw std::runtime_error("popen() failed!");
    }
    
    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
        result += buffer.data();
    }
    
    return result;
}

json PrismaClient::executeQuery(const std::string& endpoint, const std::string& method, const json& body) {
    std::stringstream ss;
    ss << "curl -s -X " << method << " ";
    ss << "-H 'Content-Type: application/json' ";
    
    if (!body.empty()) {
        // Escape the JSON for shell
        std::string jsonStr = body.dump();
        // Replace single quotes with escaped version
        size_t pos = 0;
        while ((pos = jsonStr.find("'", pos)) != std::string::npos) {
            jsonStr.replace(pos, 1, "'\\''");
            pos += 4;
        }
        ss << "-d '" << jsonStr << "' ";
    }
    
    ss << serviceUrl_ << endpoint;
    
    std::string result = executeCommand(ss.str());
    
    if (result.empty()) {
        throw std::runtime_error("Empty response from Prisma service");
    }
    
    try {
        return json::parse(result);
    } catch (const json::parse_error& e) {
        throw std::runtime_error("Failed to parse Prisma response: " + std::string(e.what()));
    }
}

std::vector<User> PrismaClient::findManyUsers() {
    auto result = executeQuery("/api/users", "GET");
    
    std::vector<User> users;
    if (result.is_array()) {
        for (const auto& item : result) {
            users.push_back(User::from_json(item));
        }
    }
    
    return users;
}

std::optional<User> PrismaClient::findUserById(int id) {
    try {
        auto result = executeQuery("/api/users/" + std::to_string(id), "GET");
        if (result.contains("error")) {
            return std::nullopt;
        }
        return User::from_json(result);
    } catch (...) {
        return std::nullopt;
    }
}

std::optional<User> PrismaClient::findUserByEmail(const std::string& email) {
    try {
        auto result = executeQuery("/api/users/email/" + email, "GET");
        if (result.contains("error")) {
            return std::nullopt;
        }
        return User::from_json(result);
    } catch (...) {
        return std::nullopt;
    }
}

User PrismaClient::createUser(const CreateUserDto& dto) {
    json body;
    body["email"] = dto.email;
    if (dto.name.has_value()) {
        body["name"] = dto.name.value();
    }
    
    auto result = executeQuery("/api/users", "POST", body);
    
    if (result.contains("error")) {
        throw std::runtime_error(result["error"].get<std::string>());
    }
    
    return User::from_json(result);
}

std::optional<User> PrismaClient::updateUser(int id, const UpdateUserDto& dto) {
    json body;
    if (dto.email.has_value()) {
        body["email"] = dto.email.value();
    }
    if (dto.name.has_value()) {
        body["name"] = dto.name.value();
    }
    
    try {
        auto result = executeQuery("/api/users/" + std::to_string(id), "PUT", body);
        if (result.contains("error")) {
            return std::nullopt;
        }
        return User::from_json(result);
    } catch (...) {
        return std::nullopt;
    }
}

bool PrismaClient::deleteUser(int id) {
    try {
        auto result = executeQuery("/api/users/" + std::to_string(id), "DELETE");
        return !result.contains("error");
    } catch (...) {
        return false;
    }
}

} // namespace vicrow
