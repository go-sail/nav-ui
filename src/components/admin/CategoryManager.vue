<template>
  <div class="category-manager">
    <div class="manager-header">
      <h2>📁 分类管理</h2>
      <div class="header-actions">
        <button @click="handleOpenAddModal" class="add-btn">
          ➕ 添加分类
        </button>
        <!-- <button @click="$emit('save')" :disabled="loading" class="save-btn">
          {{ loading ? '保存中...' : '💾 保存到GitHub' }}
        </button> -->
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="categories-list">
      <div
        v-for="(category, index) in localCategories"
        :key="category.identity"
        class="category-item clickable"
        @click="$emit('viewSites', category.identity)"
      >
        <div class="category-header">
          <div class="category-info">
            <span class="category-icon" @click.stop="editCategory(category)">
              <img :src="category.icon" :alt="category.name" @error="handleImageError" style="width: 32px; height: 32px;">
            </span>
            <div class="category-details">
              <h3 @click.stop="editCategory(category)">{{ category.name }}</h3>
              <p>{{ category.sites?.length || 0 }} 个站点 → 点击查看站点管理</p>
            </div>
          </div>
          <div class="category-actions">
            <span class="order-badge">排序: {{ category.sortIndex }}</span>
            <button @click.stop="moveCategory(index, -1)" :disabled="index === 0" class="move-btn">
              ⬆️
            </button>
            <button @click.stop="moveCategory(index, 1)" :disabled="index === localCategories.length - 1" class="move-btn">
              ⬇️
            </button>
            <button @click.stop="editCategory(category)" class="edit-btn">
              ✏️ 编辑
            </button>
            <button @click.stop="handleDeleteCategory(category.identity)" class="delete-btn">
              🗑️ 删除
            </button>
          </div>
        </div>

        <!-- 站点预览 -->
        <div class="sites-preview" v-if="category.sites && category.sites.length > 0">
          <div class="sites-grid">
            <div
              v-for="site in category.sites.slice(0, 6)"
              :key="site.id"
              class="site-preview"
            >
              <img :src="site.icon" :alt="site.name" @error="handleImageError">
              <span>{{ site.name }}</span>
            </div>
            <div v-if="category.sites.length > 6" class="more-sites">
              +{{ category.sites.length - 6 }} 更多
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑分类弹窗 -->
    <div v-if="showAddModal || editingCategory" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingCategory ? '编辑分类' : '添加分类' }}</h3>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>

        <form @submit.prevent="handleSaveCategory" class="category-form">
          <div class="form-group">
            <label>分类图标:</label>
            <div class="logo-upload-area">
              <div class="logo-preview">
                <img
                  v-if="logoPreview"
                  :src="logoPreview"
                  alt="Icon预览"
                  class="logo-preview-img"
                >
                <img
                  v-else-if="currentLogo"
                  :src="currentLogo"
                  alt="当前Icon"
                  class="logo-preview-img"
                  style="width: 32px; height: 32px;"
                >
                <div v-else class="logo-placeholder">
                  <span>🖼️</span>
                  <p>暂无Icon</p>
                </div>
              </div>
              <div class="logo-upload-controls">
                <input
                  ref="logoFileInput"
                  type="file"
                  accept="image/png"
                  @change="handleLogoSelect"
                  style="display: none"
                >
                <button type="button" @click="selectLogo" class="select-logo-btn">
                  📁 选择图像文件
                </button>
                <button
                  type="button"
                  @click="saveLogoToServer"
                  :disabled="logoSaving || !selectedLogoFile"
                  class="save-logo-btn"
                  v-if="selectedLogoFile"
                >
                  {{ logoSaving ? '上传中...' : '🚀 上传Icon' }}
                </button>
              </div>
            </div>
            <p class="setting-description">仅支持图像格式</p>
          </div>
          <!-- <div class="form-group">
            <label>分类图标:</label>
            <div class="icon-input">
              <input
                v-model="formData.icon"
                placeholder="输入emoji图标"
                class="form-input icon-preview"
              >
              <div class="emoji-suggestions">
                <span
                  v-for="emoji in emojiSuggestions"
                  :key="emoji"
                  @click="formData.icon = emoji"
                  class="emoji-item"
                >
                  {{ emoji }}
                </span>
              </div>
            </div>
          </div> -->

          <div class="form-group">
            <label>分类名称:</label>
            <input
              v-model="formData.name"
              required
              placeholder="请输入分类名称"
              class="form-input"
            >
          </div>

          <!-- <div class="form-group">
            <label>排序顺序:</label>
            <input
              v-model.number="formData.order"
              type="number"
              required
              placeholder="数字越小排序越靠前"
              class="form-input"
            >
          </div> -->

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">取消</button>
            <button type="button" @click="handleSaveCategory" class="submit-btn">
              {{ editingCategory ? '更新' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <CustomDialog
      :visible="dialogVisible"
      :type="dialogType"
      :title="dialogTitle"
      :message="dialogMessage"
      :details="dialogDetails"
      @close="closeDialog"
      @confirm="closeDialog"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import CustomDialog from '../admin/CustomDialog.vue'
import { useNavigation } from '../../apis/useNavigation.js'

const { sortCategories, uploadIcon, saveCategory, getNavList, deleteCategory } = useNavigation()

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'save', 'viewSites'])

// 本地分类数据
const localCategories = ref([])

// 弹窗状态
const showAddModal = ref(false)
const editingCategory = ref(null)

// 表单数据
const formData = ref({
  icon: '',
  name: '',
})

// Emoji建议
const emojiSuggestions = [
  '📁', '🛠️', '🎨', '📚', '👥', '⚙️', '🎮', '💼',
  '☁️', '🔧', '📊', '🎵', '📱', '💻', '🌐', '🔍'
]

// 监听props变化
watch(() => props.categories, (newCategories) => {
  localCategories.value = JSON.parse(JSON.stringify(newCategories))
}, { immediate: true, deep: true })

// 手动同步到父组件的函数，避免无限循环
const syncToParent = async () => {
  const navList = await getNavList()

  emit('update', navList)
}

// 移动分类
const moveCategory = async (index, direction) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= localCategories.value.length) return

  const categories = [...localCategories.value]
  const item = categories.splice(index, 1)[0]
  categories.splice(newIndex, 0, item)

  let identities = []
  // 重新排序
  categories.forEach((category, idx) => {
    category.sortIndex = idx + 1
    identities.push(category.identity)
  })

  await sortCategories(identities)

  localCategories.value = categories
  syncToParent()
}

// 编辑分类
const editCategory = (category) => {
  editingCategory.value = category
  currentLogo.value = category.icon
  formData.value = {
    icon: category.icon,
    name: category.name,
  }
}

// 删除分类
const handleDeleteCategory = async (categoryId) => {
  if (confirm('确定要删除这个分类吗？这将同时删除分类下的所有站点。')) {
    await deleteCategory(categoryId)
    syncToParent()
  }
}

// 打开添加分类弹窗
const handleOpenAddModal = () => {
  editingCategory.value = null
  formData.value = {
    icon: '',
    name: '',
  }
  currentLogo.value = ''
  showAddModal.value = true
}
// 保存分类
const handleSaveCategory = async () => {
  let categoryReq = {
    identity: '',
    name: '',
    icon: '',
  }
  console.log('formData.value', formData.value)

  if (editingCategory.value) {
    categoryReq.identity = editingCategory.value.identity
    categoryReq.name = formData.value.name
    categoryReq.icon = formData.value.icon
  } else {
    categoryReq.identity = ''
    categoryReq.name = formData.value.name
    categoryReq.icon = formData.value.icon
  }

  await saveCategory(categoryReq)

  syncToParent()
  closeModal()
}

// 关闭弹窗
const closeModal = () => {
  showAddModal.value = false
  editingCategory.value = null
  formData.value = {
    icon: '',
    name: '',
  }
}

// 处理图片错误
const handleImageError = (event) => {
  // 设置默认的 favicon.ico 作为 fallback 图片
  event.target.src = '/favicon.ico'
  event.target.onerror = null // 防止无限循环
}

const logoFileInput = ref(null)
const selectedLogoFile = ref(null)
const logoPreview = ref('')
const currentLogo = ref('')
const logoSaving = ref(false)

// 自定义弹框状态
const dialogVisible = ref(false)
const dialogType = ref('success')
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogDetails = ref([])

// 显示弹框
const showDialog = (type, title, message, details = []) => {
  dialogType.value = type
  dialogTitle.value = title
  dialogMessage.value = message
  dialogDetails.value = details
  dialogVisible.value = true
}

// 关闭弹框
const closeDialog = () => {
  dialogVisible.value = false
}

// 选择Logo文件
const selectLogo = () => {
  logoFileInput.value?.click()
}

// 处理Logo文件选择
const handleLogoSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.includes('image/')) {
    showDialog(
      'error',
      '❌ 文件格式错误',
      '请选择图片文件',
      []
    )
    return
  }

  // 验证文件大小 (限制为2MB)
  if (file.size > 2 * 1024 * 1024) {
    showDialog(
      'error',
      '❌ 文件过大',
      '图片文件大小不能超过2MB',
      [`• 当前文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`]
    )
    return
  }

  selectedLogoFile.value = file
}

// 保存Logo到GitHub
const saveLogoToServer = async () => {
  if (!selectedLogoFile.value) {
    showDialog(
      'error',
      '❌ 未选择文件',
      '请先选择Logo文件',
      []
    )
    return
  }

  logoSaving.value = true
  try {
    const url = await uploadIcon('category', selectedLogoFile.value)

    // 更新当前Logo显示
    currentLogo.value = url

    // 清理选择的文件
    selectedLogoFile.value = null
    logoPreview.value = ''
    logoFileInput.value.value = ''
    formData.value.icon = url

    showDialog(
      'success',
      '🎉 Icon上传成功',
      '您的分类Icon已成功保存到服务器！',
      []
    )
  } catch (error) {
    console.error('上传Icon失败:', error)
    showDialog(
      'error',
      '❌ 上传失败',
      'Icon上传过程中发生错误，请重试',
      [`• 错误详情: ${error.message}`]
    )
  } finally {
    logoSaving.value = false
  }
}
</script>

<style scoped>
.category-manager {
  padding: 20px 0;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.manager-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.add-btn, .save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn {
  background: #27ae60;
  color: white;
}

.add-btn:hover {
  background: #219a52;
}

.save-btn {
  background: #3498db;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #2980b9;
}

.save-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.category-item.clickable {
  cursor: pointer;
}

.category-item.clickable:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #f1f3f4;
  border-color: #3498db;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-icon {
  font-size: 32px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.category-icon:hover {
  background: rgba(52, 152, 219, 0.1);
}

.category-details h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  cursor: pointer;
  transition: color 0.3s ease;
}

.category-details h3:hover {
  color: #3498db;
}

.category-details p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.category-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-badge {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.move-btn, .edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.move-btn {
  background: #95a5a6;
  color: white;
}

.move-btn:hover:not(:disabled) {
  background: #7f8c8d;
}

.move-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-btn {
  background: #f39c12;
  color: white;
}

.edit-btn:hover {
  background: #e67e22;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
}

.sites-preview {
  margin-top: 15px;
}

.sites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.site-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.site-preview img {
  width: 24px;
  height: 24px;
  margin-bottom: 5px;
  object-fit: contain;
}

.site-preview span {
  font-size: 12px;
  color: #7f8c8d;
  text-align: center;
  line-height: 1.2;
}

.more-sites {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: #ecf0f1;
  border-radius: 6px;
  color: #7f8c8d;
  font-size: 12px;
  font-weight: 500;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
}

.category-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #e1e1e1;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.icon-input {
  position: relative;
}

.icon-preview {
  font-size: 20px;
  text-align: center;
}

.emoji-suggestions {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.emoji-item:hover {
  background: #3498db;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.cancel-btn, .submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.submit-btn {
  background: #27ae60;
  color: white;
}

.submit-btn:hover {
  background: #219a52;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .category-actions {
    flex-wrap: wrap;
  }

  .sites-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

/* Logo设置样式 */
.logo-upload-area {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.logo-preview {
  width: 128px;
  height: 128px;
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  overflow: hidden;
}

.logo-preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #7f8c8d;
  text-align: center;
}

.logo-placeholder span {
  font-size: 32px;
  margin-bottom: 8px;
}

.logo-placeholder p {
  margin: 0;
  font-size: 13px;
}

.logo-upload-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.select-logo-btn, .save-logo-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.select-logo-btn {
  background: #95a5a6;
  color: white;
}

.select-logo-btn:hover {
  background: #7f8c8d;
}

.save-logo-btn {
  background: #27ae60;
  color: white;
}

.save-logo-btn:hover:not(:disabled) {
  background: #219a52;
}

.save-logo-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .logo-upload-area {
    flex-direction: column;
    align-items: center;
  }

  .logo-upload-controls {
    align-items: center;
  }
}
</style>
