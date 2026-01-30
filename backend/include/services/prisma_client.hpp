#pragma once

#include <string>
#include <vector>
#include <optional>
#include <nlohmann/json.hpp>
#include "models/user.hpp"

namespace vicrow {

using json = nlohmann::json;

/**
 * @brief Prisma Client for database operations
 * 
 * This client communicates with a Node.js Prisma server
 * that handles actual database operations
 */
class PrismaClient {
public:
    PrismaClient();
    ~PrismaClient();

    /**
     * @brief Check if the Prisma service is connected
     */
    bool isConnected() const;

    /**
     * @brief Connect to the Prisma service
     */
    bool connect();

    /**
     * @brief Disconnect from the Prisma service
     */
    void disconnect();

    // User CRUD operations
    std::vector<User> findManyUsers();
    std::optional<User> findUserById(int id);
    std::optional<User> findUserByEmail(const std::string& email);
    User createUser(const CreateUserDto& dto);
    std::optional<User> updateUser(int id, const UpdateUserDto& dto);
    bool deleteUser(int id);

    /**
     * @brief Get the Prisma service URL
     */
    std::string getServiceUrl() const { return serviceUrl_; }

    /**
     * @brief Set the Prisma service URL
     */
    void setServiceUrl(const std::string& url) { serviceUrl_ = url; }

private:
    std::string serviceUrl_;
    bool connected_;

    /**
     * @brief Execute HTTP request to Prisma service
     */
    json executeQuery(const std::string& endpoint, const std::string& method = "GET", 
                      const json& body = json::object());
    
    /**
     * @brief Execute a shell command and return output
     */
    std::string executeCommand(const std::string& command);
};

} // namespace vicrow
