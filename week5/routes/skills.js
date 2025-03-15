const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Skill')

const { isNotValidSting,isUndefined } = require('../utils/validUtils')

router.get('/', async (req, res, next) => {
    try {
        const skills = await dataSource.getRepository("Skill").find({
          select: ["id", "name"]
        })
        res.status(200).json
        ({
          status: "success",
          data: skills
        })
      } catch (error) {
        next(error);
      }
})
router.post('/', async (req, res, next) => {
    try {
        const {name} = req.body;
        if (isUndefined(name) || isNotValidSting(name)) {
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
            return
        }
        const SkillRepo = await dataSource.getRepository("Skill")
        //確認購買方案名稱是否重複
        const findCreditPackage = await SkillRepo.find({
          where: {
            name:name
          }
        })
        if (findCreditPackage.length > 0) {
          res.status(400).json({
            status: "failed",
            message: "資料重複"
          })
          return
        }
        const newSkill = await SkillRepo.create({
          name:name
        })
        const result = await SkillRepo.save(newSkill)
        res.status(200).json({
          status: "success",
          data: result
        })
      } catch (error) {
        next(error);
      }
    })

router.delete('/:skillId', async (req, res, next) => {
    try {
        const {skillId} = req.params
        if (isUndefined(skillId) || isNotValidSting(skillId)) {
          res.status(400).json({
            status: "failed",
            message: "ID錯誤"
          })
          return
        }
        const result = await dataSource.getRepository("Skill").delete(skillId)
        if (result.affected === 0) {
          res.status(400).json({
            status: "failed",
            message: "ID錯誤"
          })
          return
        }
        res.status(200).json({
          status: "success"
        })
      } catch (error) {
        next(error);
      }
    })

module.exports = router