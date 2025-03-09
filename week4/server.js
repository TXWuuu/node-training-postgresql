require("dotenv").config()
const http = require("http")
const AppDataSource = require("./db")

function isUndefined(value) {
  return value === undefined
}

function isNotValidSting(value) {
  return (
      typeof value !== 'string' || value.trim().length === 0 || value === ''
  )
}

function isNotValidInteger(value) {
  return typeof value !== 'number' || value < 0 || value % 1 !== 0
}


const requestListener = async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json"
  }

  let body = ""
  req.on("data", (chunk) => {
    body += chunk
  })

  if (req.url === "/api/credit-package" && req.method === "GET") {
    try {
      const package = await AppDataSource.getRepository("CreditPackage").find({
        select: ["id", "name", "credit_amount", "price"]
      })
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success",
        data: package
      }))
      res.end()
    } catch (error) {
      errorMessage(res);
    }
  } else if (req.url === "/api/credit-package" && req.method === "POST") {
    req.on("end", async () => {
      try {
        //驗證欄位填寫
        const data = JSON.parse(body)
        if (isUndefined(data.name) || isNotValidSting(data.name) ||
                isUndefined(data.credit_amount) || isNotValidInteger(data.credit_amount) ||
                isUndefined(data.price) || isNotValidInteger(data.price)) {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確"
          }))
          res.end()
          return
        }
        //確認有無資料重複
        const creditPackage = await AppDataSource.getRepository("CreditPackage")
        const findCreditPackage = await creditPackage.find({
          where: {
            name: data.name
          }
        })
        if (findCreditPackage.length > 0) {
          res.writeHead(409, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "資料重複"
          }))
          res.end()
          return
        }
        const newPackage = await creditPackage.create({
          name: data.name,
          credit_amount: data.credit_amount,
          price: data.price
        })
        const result = await creditPackage.save(newPackage)
        res.writeHead(200, headers)
        res.write(JSON.stringify({
          status: "success",
          data: result
        }))
        res.end()
      } catch (error) {
        errorMessage(res);
      }
    })
  } else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
    try {
      const packageId = req.url.split("/").pop()
      if (isUndefined(packageId) || isNotValidSting(packageId)) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end()
        return
      }
      const result = await AppDataSource.getRepository("CreditPackage").delete(packageId)
      if (result.affected === 0) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end()
        return
      }
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success"
      }))
      res.end()
    } catch (error) {
      errorMessage(res);
    }
  } else if(req.url === "/api/coaches/skill" && req.method === "GET"){
    try {
      const skills = await AppDataSource.getRepository("Skill").find({
        select: ["id", "name"]
      })
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success",
        data: skills
      }))
      res.end()
    } catch (error) {
      errorMessage(res);
    }
  }else if (req.url === "/api/coaches/skill" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body)
        //確認輸入格式
        if (isUndefined(data.name) || isNotValidSting(data.name)) {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確"
          }))
          res.end()
          return
        }
        const SkillRepo = await AppDataSource.getRepository("Skill")
        //確認購買方案名稱是否重複
        const findCreditPackage = await SkillRepo.find({
          where: {
            name: data.name
          }
        })
        if (findCreditPackage.length > 0) {
          res.writeHead(409, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "資料重複"
          }))
          res.end()
          return
        }
        const newSkill = await SkillRepo.create({
          name: data.name
        })
        const result = await SkillRepo.save(newSkill)
        res.writeHead(200, headers)
        res.write(JSON.stringify({
          status: "success",
          data: result
        }))
        res.end()
      } catch (error) {
        errorMessage(res);
      }
    })
  }else if(req.url.startsWith("/api/coaches/skill")&& req.method === "DELETE"){
    try {
      const skillId = req.url.split("/").pop()
      if (isUndefined(skillId) || isNotValidSting(skillId)) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end()
        return
      }
      const result = await AppDataSource.getRepository("Skill").delete(skillId)
      if (result.affected === 0) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end()
        return
      }
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success"
      }))
      res.end()
    } catch (error) {
      errorMessage(res);
    }
  }
  else if (req.method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end()
  } else {
    res.writeHead(404, headers)
    res.write(JSON.stringify({
      status: "failed",
      message: "無此網站路由"
    }))
    res.end()
  }
}

const server = http.createServer(requestListener)


async function startServer() {
  await AppDataSource.initialize()
  console.log("資料庫連接成功")
  server.listen(process.env.PORT)
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
  return server;
}

module.exports = startServer();
