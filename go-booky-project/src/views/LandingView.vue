<template>
  <div class="landing-view">
    <!-- Main Section with Grid Layout -->
    <section class="main-section">
      <!-- Left Side - GoBooky Title -->
      <div class="left-section">
        <h1 class="gobooky-title">Go<span class="booky-white">Booky</span></h1>
      </div>

      <!-- Right Side - Books and Threads -->
      <div class="right-section">
        <!-- Recommended Books - Top Right -->
        <div class="books-section">
          <!-- (제거된 section-title, 요청대로 사용하지 않음) -->
          <div class="recommended-books">
            <Swiper
              ref="swiperRef"
              :modules="modules"
              :slides-per-view="5"
              :space-between="8"
              :loop="true"
              :speed="1200"
              :effect="'slide'"
              :grab-cursor="true"
              :allow-touch-move="true"
              :breakpoints="{
                320: { slidesPerView: 2, spaceBetween: 6 },
                480: { slidesPerView: 2.5, spaceBetween: 6 },
                640: { slidesPerView: 3, spaceBetween: 6 },
                800: { slidesPerView: 3.5, spaceBetween: 6 },
                968: { slidesPerView: 4, spaceBetween: 8 },
                1200: { slidesPerView: 5, spaceBetween: 8 },
                1600: { slidesPerView: 6, spaceBetween: 8 },
              }"
              class="books-swiper"
              @swiper="onSwiper"
            >
              <SwiperSlide v-for="book in books" :key="book.id" class="book-slide">
                <div class="book-card">
                  <div class="book-image-wrapper">
                    <img :src="book.cover" :alt="book.title" class="book-image" />
                    <div class="book-overlay">
                      <span class="view-details">자세히 보기</span>
                    </div>
                  </div>
                  <div class="book-info">
                    <h3 class="book-title">{{ book.title }}</h3>
                    <p class="book-author">{{ book.author }}</p>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>

        <!-- Recommended Threads - Bottom Right -->
        <div class="threads-section">
          <h2 class="section-title">추천 쓰레드</h2>
          <ul class="threads-list">
            <li v-for="thread in threads" :key="thread.id" class="thread-item">
              {{ thread.title }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { gsap } from 'gsap'
import skrollr from 'skrollr'

// Swiper modules
const modules = [Navigation]

// Swiper instance
const swiperRef = ref(null)
let swiperInstance = null
let autoSlideTimeline = null
let isHovered = false

// 10권 책 데이터
const books = ref([
  {
    id: 1,
    cover: 'https://picsum.photos/seed/book1/150/200',
    title: 'The Great Adventure',
    author: 'Author A',
  },
  {
    id: 2,
    cover: 'https://picsum.photos/seed/book2/150/200',
    title: 'Mystery of Time',
    author: 'Author B',
  },
  {
    id: 3,
    cover: 'https://picsum.photos/seed/book3/150/200',
    title: 'Digital Dreams',
    author: 'Author C',
  },
  {
    id: 4,
    cover: 'https://picsum.photos/seed/book4/150/200',
    title: 'Ocean Stories',
    author: 'Author D',
  },
  {
    id: 5,
    cover: 'https://picsum.photos/seed/book5/150/200',
    title: 'Mountain Journey',
    author: 'Author E',
  },
  {
    id: 6,
    cover: 'https://picsum.photos/seed/book6/150/200',
    title: 'City Lights',
    author: 'Author F',
  },
  {
    id: 7,
    cover: 'https://picsum.photos/seed/book7/150/200',
    title: 'Forest Whispers',
    author: 'Author G',
  },
  {
    id: 8,
    cover: 'https://picsum.photos/seed/book8/150/200',
    title: 'Space Odyssey',
    author: 'Author H',
  },
  {
    id: 9,
    cover: 'https://picsum.photos/seed/book9/150/200',
    title: 'Ancient Secrets',
    author: 'Author I',
  },
  {
    id: 10,
    cover: 'https://picsum.photos/seed/book10/150/200',
    title: 'Future Vision',
    author: 'Author J',
  },
])

const threads = ref([
  { id: 1, title: 'Thread 1' },
  { id: 2, title: 'Thread 2' },
  { id: 3, title: 'Thread 3' },
])

function onSwiper(swiper) {
  swiperInstance = swiper
  startGSAPAutoSlide()
  setupMagneticHover()
}

function startGSAPAutoSlide() {
  autoSlideTimeline = gsap.timeline({ repeat: -1 })
  autoSlideTimeline
    .to(
      {},
      {
        duration: 2.5,
        ease: 'power2.inOut',
        onComplete: () => {
          if (!isHovered && swiperInstance) {
            swiperInstance.slideNext()
          }
        },
      },
    )
    .to(
      {},
      {
        duration: 1.5,
        ease: 'power1.out',
      },
    )
}

function setupMagneticHover() {
  gsap.utils.toArray('.book-card').forEach((card) => {
    const magnetic = card.querySelector('.book-image-wrapper')

    card.addEventListener('mouseenter', () => {
      gsap.to(magnetic, {
        duration: 0.3,
        scale: 1.05,
        rotationY: 5,
        rotationX: 2,
        ease: 'power2.out',
        transformPerspective: 1000,
      })
    })

    card.addEventListener('mouseleave', () => {
      gsap.to(magnetic, {
        duration: 0.5,
        scale: 1,
        rotationY: 0,
        rotationX: 0,
        ease: 'elastic.out(1, 0.3)',
      })
    })

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10

      gsap.to(magnetic, {
        duration: 0.3,
        rotationX: rotateX,
        rotationY: rotateY,
        ease: 'power2.out',
      })
    })
  })
}

onMounted(() => {
  skrollr.init()

  gsap.fromTo(
    '.book-card',
    { opacity: 0, y: 30, rotationY: 15 },
    {
      opacity: 1,
      y: 0,
      rotationY: 0,
      duration: 0.8,
      ease: 'back.out(1.7)',
      stagger: 0.1,
      delay: 1,
    },
  )

  const swiperContainer = document.querySelector('.books-swiper')
  if (swiperContainer) {
    swiperContainer.addEventListener('mouseenter', () => {
      isHovered = true
      autoSlideTimeline?.pause()
    })
    swiperContainer.addEventListener('mouseleave', () => {
      isHovered = false
      autoSlideTimeline?.resume()
    })
  }
})

onUnmounted(() => {
  autoSlideTimeline?.kill()
})
</script>

<style scoped>
.landing-view {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  height: 100vh;
  background: linear-gradient(150deg, #e8f2ff 0%, #f0f8ff 100%);
}

.main-section {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  grid-template-rows: 1fr;
  height: 100vh;
  width: 100%;
}

.left-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.gobooky-title {
  font-family: 'Comfortaa', sans-serif;
  font-size: 4rem;
  color: #0b3d91;
  margin: 0;
  text-align: center;
  font-weight: 700;
  text-shadow: 0 4px 8px rgba(11, 61, 145, 0.2);
}

.booky-white {
  color: white;
}

.right-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 2rem;
  gap: 2rem;
}

.books-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  position: relative;
  min-height: 300px;
}

.threads-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  position: relative;
  max-width: 90%;
}

.section-title {
  font-family: 'Comfortaa', sans-serif;
  font-size: 1.8rem;
  color: #0b3d91;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 700;
}

.recommended-books {
  width: 100%;
  padding: 0 1rem;
  position: relative;
}

.books-swiper {
  width: 100%;
  padding: 10px 0 20px 0;
  height: 280px;
  overflow: visible;
}

.book-slide {
  height: auto;
  display: flex;
  justify-content: center;
}

.book-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 12px 30px rgba(11, 61, 145, 0.15),
    0 4px 12px rgba(11, 61, 145, 0.08),
    0 2px 4px rgba(11, 61, 145, 0.06);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(11, 61, 145, 0.12);
  width: 100%;
  max-width: 140px;
  cursor: pointer;
  transform-style: preserve-3d;
  perspective: 1000px;
  position: relative;
}

.book-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    rgba(11, 61, 145, 0.1),
    rgba(40, 121, 200, 0.1),
    rgba(11, 61, 145, 0.1)
  );
  border-radius: 14px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.book-card:hover::before {
  opacity: 1;
}

.book-card:hover {
  box-shadow:
    0 20px 45px rgba(11, 61, 145, 0.25),
    0 12px 25px rgba(11, 61, 145, 0.15),
    0 6px 12px rgba(11, 61, 145, 0.1);
  transform: translateY(-8px);
}

.book-image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  transform-style: preserve-3d;
  will-change: transform;
}

.book-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.book-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(11, 61, 145, 0.85), rgba(40, 121, 200, 0.85));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.4s ease;
}

.book-card:hover .book-overlay {
  opacity: 1;
}

.book-card:hover .book-image {
  transform: scale(1.06);
}

.view-details {
  color: white;
  font-family: 'Comfortaa', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 6px 12px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.book-card:hover .view-details {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
  transform: scale(1.05);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
}

.book-info {
  padding: 1rem 0.8rem;
  text-align: center;
}

.book-title {
  font-family: 'Comfortaa', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0b3d91;
  margin: 0 0 0.4rem 0;
  line-height: 1.2;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.book-card:hover .book-title {
  color: #2879c8;
}

.book-author {
  font-family: 'Ubuntu', sans-serif;
  font-size: 0.75rem;
  color: #666;
  margin: 0;
  font-weight: 400;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.book-card:hover .book-author {
  color: #555;
  opacity: 1;
}

.threads-list {
  list-style: none;
  padding: 0;
  width: 100%;
  margin: 0;
}

.thread-item {
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(11, 61, 145, 0.08);
  font-family: 'Ubuntu', sans-serif;
  color: #333;
  transition: all 0.3s ease;
  border-left: 3px solid #2879c8;
  cursor: pointer;
  font-size: 0.9rem;
}

.thread-item:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 16px rgba(11, 61, 145, 0.12);
  background: #f8faff;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-section {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .left-section {
    padding: 1rem;
    min-height: 150px;
  }

  .right-section {
    padding: 1rem;
  }

  .gobooky-title {
    font-size: 2.5rem;
  }

  .books-section {
    padding-bottom: 1rem;
  }

  .threads-section {
    padding-top: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .book-card {
    max-width: 100px;
  }

  .book-image {
    height: 100px;
  }
}

@media (max-width: 480px) {
  .gobooky-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .book-card {
    max-width: 90px;
  }

  .book-image {
    height: 90px;
  }

  .thread-item {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
  }
}

@media (min-width: 1600px) {
  .gobooky-title {
    font-size: 5rem;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>
