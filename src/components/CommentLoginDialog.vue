<template>
  <div>
    <el-dialog
      title="登录后发表评论"
      :visible.sync="dialogVisible"
      width="420px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-tabs v-model="loginType" @tab-click="handleTabChange">
        <el-tab-pane label="账号登录" name="password" />
        <el-tab-pane label="邮箱登录" name="email" />
      </el-tabs>

      <el-form
        v-if="loginType === 'password'"
        ref="passwordForm"
        :model="passwordForm"
        :rules="passwordRules"
      >
        <el-form-item prop="username">
          <el-input v-model="passwordForm.username" placeholder="请输入用户名/邮箱/手机号" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
            @keyup.enter.native="handleLoginClick"
          />
        </el-form-item>
      </el-form>

      <el-form
        v-else
        ref="emailForm"
        :model="emailForm"
        :rules="emailRules"
      >
        <el-form-item prop="email">
          <el-input v-model="emailForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-row">
            <el-input
              v-model="emailForm.code"
              placeholder="请输入验证码"
              @keyup.enter.native="handleLoginClick"
            />
            <el-button
              class="send-code-btn"
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isLoggingIn" @click="handleLoginClick">登录评论</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="安全验证"
      :visible.sync="showCaptcha"
      width="360px"
      :close-on-click-modal="false"
      :show-close="!isLoggingIn"
      append-to-body
      @close="handleCaptchaClose"
    >
      <slide-captcha
        ref="slideCaptcha"
        @slide-complete="handleSlideComplete"
        @load-error="handleCaptchaLoadError"
      />
      <div slot="footer" class="dialog-footer">
        <el-button :disabled="isLoggingIn" @click="showCaptcha = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SlideCaptcha from '@/components/SlideCaptcha/index.vue'
import { getProfileInfo, getPublicKey, login, sendEmailCode } from '@/api/auth'
import { rsaEncrypt } from '@/utils/encrypt'
import { setAccessToken } from '@/utils/auth'

export default {
  name: 'CommentLoginDialog',
  components: {
    SlideCaptcha
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const validateEmail = (rule, value, callback) => {
      const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!value) {
        callback(new Error('请输入邮箱'))
      } else if (!emailReg.test(value)) {
        callback(new Error('邮箱格式不正确'))
      } else {
        callback()
      }
    }

    return {
      dialogVisible: false,
      loginType: 'password',
      passwordForm: {
        username: '',
        password: ''
      },
      emailForm: {
        email: '',
        code: ''
      },
      passwordRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      emailRules: {
        email: [{ required: true, validator: validateEmail, trigger: 'blur' }],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码长度必须为6位', trigger: 'blur' }
        ]
      },
      publicKey: '',
      isLoggingIn: false,
      showCaptcha: false,
      countdown: 0,
      timer: null
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler (val) {
        this.dialogVisible = val
        if (val) {
          this.ensurePublicKey()
        }
      }
    },
    dialogVisible (val) {
      this.$emit('update:visible', val)
    }
  },
  beforeDestroy () {
    this.clearTimer()
  },
  methods: {
    async ensurePublicKey () {
      if (this.publicKey) {
        return
      }
      try {
        const res = await getPublicKey()
        this.publicKey = res && res.data ? res.data : res
      } catch (error) {
        console.error(error)
        this.$message.error('获取公钥失败，请稍后重试')
      }
    },
    handleTabChange () {
      this.$nextTick(() => {
        if (this.$refs.passwordForm) {
          this.$refs.passwordForm.clearValidate()
        }
        if (this.$refs.emailForm) {
          this.$refs.emailForm.clearValidate()
        }
      })
    },
    async handleSendCode () {
      if (this.countdown > 0) {
        return
      }
      try {
        await new Promise((resolve, reject) => {
          this.$refs.emailForm.validateField('email', message => {
            if (message) {
              reject(new Error(message))
            } else {
              resolve()
            }
          })
        })
        await sendEmailCode(this.emailForm.email)
        this.$message.success('验证码已发送，请查收邮箱')
        this.countdown = 60
        this.timer = setInterval(() => {
          this.countdown -= 1
          if (this.countdown <= 0) {
            this.clearTimer()
          }
        }, 1000)
      } catch (error) {
        console.error(error)
      }
    },
    handleLoginClick () {
      const formRef = this.loginType === 'password' ? 'passwordForm' : 'emailForm'
      this.$refs[formRef].validate(async valid => {
        if (!valid) {
          return
        }
        if (this.loginType === 'password' && !this.publicKey) {
          await this.ensurePublicKey()
          if (!this.publicKey) {
            return
          }
        }
        this.showCaptcha = true
      })
    },
    async handleSlideComplete ({ captchaKey, slideX }) {
      this.isLoggingIn = true
      if (this.$refs.slideCaptcha) {
        this.$refs.slideCaptcha.setVerifying(true)
      }
      try {
        const loginParams = {
          loginType: this.loginType,
          captchaKey,
          slideX
        }

        if (this.loginType === 'password') {
          loginParams.username = this.passwordForm.username
          loginParams.password = rsaEncrypt(this.passwordForm.password, this.publicKey)
        } else {
          loginParams.email = this.emailForm.email
          loginParams.code = this.emailForm.code
        }

        const loginRes = await login(loginParams)
        const token = loginRes && loginRes.data ? loginRes.data : loginRes
        if (!token) {
          throw new Error('登录失败')
        }
        setAccessToken(token)

        const userRes = await getProfileInfo()
        const userInfo = userRes && userRes.data ? userRes.data : userRes

        this.$message.success('登录成功')
        this.showCaptcha = false
        this.dialogVisible = false
        this.$emit('login-success', { token, userInfo })
      } catch (error) {
        console.error(error)
        if (this.$refs.slideCaptcha) {
          this.$refs.slideCaptcha.refreshCaptcha()
        }
      } finally {
        this.isLoggingIn = false
        if (this.$refs.slideCaptcha) {
          this.$refs.slideCaptcha.setVerifying(false)
        }
      }
    },
    handleCaptchaClose () {
      if (this.isLoggingIn) {
        return
      }
      this.showCaptcha = false
    },
    handleCaptchaLoadError () {
      this.$message.error('验证码加载失败，请重试')
      this.showCaptcha = false
    },
    handleDialogClose () {
      this.showCaptcha = false
    },
    clearTimer () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.countdown = 0
    }
  }
}
</script>

<style scoped>
.code-row {
  display: flex;
  gap: 8px;
}

.send-code-btn {
  min-width: 110px;
}
</style>
