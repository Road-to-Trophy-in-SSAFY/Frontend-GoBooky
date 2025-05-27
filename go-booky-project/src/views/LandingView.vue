<template>
  <div class="landing-view">
    <!-- Cover Section with Brand Logo and Books -->
    <section class="cover">
      <!-- Logo positioned at 1/3 height -->
      <div class="logo-section">
        <img src="/logo.png" alt="GoBooky Logo" class="cover-logo" />
      </div>

      <!-- Recommended Books Slider positioned at 2/3 height -->
      <div class="books-section">
        <div class="recommended-books">
          <swiper
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
            <swiper-slide v-for="book in books" :key="book.id" class="book-slide">
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
            </swiper-slide>
          </swiper>
        </div>
      </div>
    </section>

    <!-- Recommended Threads List -->
    <section class="recommended-threads">
      <h2>추천 쓰레드</h2>
      <ul>
        <li v-for="thread in threads" :key="thread.id">{{ thread.title }}</li>
      </ul>
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
  // GSAP Timeline으로 더 부드러운 자동 슬라이딩
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
  // 각 카드에 Magnetic Hover 효과 추가
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

  // 로고 애니메이션 향상
  gsap.fromTo(
    '.cover-logo',
    {
      opacity: 0,
      y: 50,
      scale: 0.8,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.5,
      ease: 'elastic.out(1, 0.5)',
      delay: 0.5,
    },
  )

  // 카드들 등장 애니메이션
  gsap.fromTo(
    '.book-card',
    {
      opacity: 0,
      y: 30,
      rotationY: 15,
    },
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

  // 마우스 호버 이벤트 리스너
  const swiperContainer = document.querySelector('.books-swiper')
  if (swiperContainer) {
    swiperContainer.addEventListener('mouseenter', () => {
      isHovered = true
      if (autoSlideTimeline) {
        autoSlideTimeline.pause()
      }
    })
    swiperContainer.addEventListener('mouseleave', () => {
      isHovered = false
      if (autoSlideTimeline) {
        autoSlideTimeline.resume()
      }
    })
  }
})

onUnmounted(() => {
  if (autoSlideTimeline) {
    autoSlideTimeline.kill()
  }
})
</script>

<style scoped>
.landing-view {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  height: 100vh;
}

.cover {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
  height: 85vh;
  background: linear-gradient(150deg, #e8f2ff 0%, #f0f8ff 100%);
  position: relative;
  z-index: 2;
}

/* 로고 섹션 - 상단 1/3 위치 */
.logo-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.cover-logo {
  width: 300px;
  max-width: 90vw;
  height: auto;
  filter: drop-shadow(0 6px 10px rgba(11, 61, 145, 0.2));
  animation: float 4s ease-in-out infinite;
  transform-style: preserve-3d;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0%);
  }
  50% {
    transform: translateY(-5%);
  }
}

/* 도서 섹션 - 하단 2/3 위치 */
.books-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-bottom: 2rem;
  position: relative;
}

/* 추천 도서 - Swiper 스타일 */
.recommended-books {
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  position: relative;
}

/* 양 끝 페이드 효과 */
.recommended-books::before,
.recommended-books::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100px;
  z-index: 10;
  pointer-events: none;
}

.recommended-books::before {
  left: 0;
  background: linear-gradient(
    to right,
    rgba(232, 242, 255, 1) 0%,
    rgba(232, 242, 255, 0.8) 30%,
    rgba(232, 242, 255, 0) 100%
  );
}

.recommended-books::after {
  right: 0;
  background: linear-gradient(
    to left,
    rgba(240, 248, 255, 1) 0%,
    rgba(240, 248, 255, 0.8) 30%,
    rgba(240, 248, 255, 0) 100%
  );
}

.books-swiper {
  width: 100%;
  padding: 20px 0 40px 0;
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
  max-width: 160px;
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
  height: 160px;
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
  backdrop-filter: none;
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
  backdrop-filter: none;
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
  text-align: center;
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

/* 추천 쓰레드 섹션 */
.recommended-threads {
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #fafcff 0%, #f0f8ff 100%);
  position: relative;
  z-index: 1;
  margin-top: -5vh;
}

.recommended-threads h2 {
  font-family: 'Comfortaa', sans-serif;
  font-size: 2.2rem;
  color: #0b3d91;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;
}

.recommended-threads ul {
  list-style: none;
  padding: 0;
  max-width: 800px;
  margin: 0 auto;
}

.recommended-threads li {
  padding: 1rem 1.5rem;
  margin-bottom: 0.5rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(11, 61, 145, 0.08);
  font-family: 'Ubuntu', sans-serif;
  color: #333;
  transition: all 0.3s ease;
  border-left: 4px solid #2879c8;
  cursor: pointer;
}

.recommended-threads li:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 16px rgba(11, 61, 145, 0.12);
  background: #f8faff;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .cover {
    height: 90vh;
  }

  .cover-logo {
    width: 250px;
    max-width: 80vw;
  }

  .book-card {
    max-width: 140px;
  }

  .book-image {
    height: 140px;
  }

  .book-title {
    font-size: 0.8rem;
    height: 2rem;
  }

  .book-author {
    font-size: 0.7rem;
  }

  .view-details {
    font-size: 0.7rem;
    padding: 4px 8px;
  }

  .recommended-threads h2 {
    font-size: 1.8rem;
  }

  /* 모바일에서는 페이드 효과 줄이기 */
  .recommended-books::before,
  .recommended-books::after {
    width: 50px;
  }
}

@media (max-width: 480px) {
  .cover-logo {
    width: 200px;
    max-width: 75vw;
  }
}

@media (min-width: 1600px) {
  .cover-logo {
    width: 350px;
  }
}
</style>
