(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,89237,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(80265),a=e.i(70119),l=e.i(22016);e.s(["default",0,function(){let{user:e}=(0,s.useAuth)(),[o,d]=(0,i.useState)([]),[r,c]=(0,i.useState)(!0);(0,i.useEffect)(()=>{e&&n()},[e]);let n=async()=>{try{let e=localStorage.getItem("accessToken"),t=await fetch("/api/student/certificates",{headers:{Authorization:`Bearer ${e}`}}),i=await t.json();i.success&&d(i.data.certificates)}catch(e){console.error(e)}c(!1)};return e?(0,t.jsxs)("div",{className:"min-h-screen bg-gray-50",dir:"rtl",children:[(0,t.jsx)(a.default,{}),(0,t.jsxs)("main",{className:"max-w-4xl mx-auto px-4 py-8",children:[(0,t.jsx)("h1",{className:"text-2xl font-bold text-gray-900 mb-2",children:"شهاداتي"}),(0,t.jsx)("p",{className:"text-gray-500 mb-8",children:"الشهادات التي حصلت عليها من الكورسات المكتملة"}),r?(0,t.jsx)("div",{className:"text-center py-20 text-gray-400",children:"جاري التحميل..."}):0===o.length?(0,t.jsxs)("div",{className:"text-center py-20 bg-white rounded-xl border",children:[(0,t.jsx)("i",{className:"fa-solid fa-certificate text-5xl text-gray-300 mb-4"}),(0,t.jsx)("p",{className:"text-gray-500 font-semibold",children:"لا توجد شهادات بعد"}),(0,t.jsx)("p",{className:"text-gray-400 text-sm mt-1",children:"أكمل كورساً للحصول على شهادة"}),(0,t.jsx)(l.default,{href:"/courses",className:"inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700",children:"تصفح الكورسات"})]}):(0,t.jsx)("div",{className:"grid md:grid-cols-2 gap-6",children:o.map(i=>(0,t.jsxs)("div",{className:"bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition",children:[(0,t.jsxs)("div",{className:"bg-gradient-to-l from-indigo-600 to-purple-600 p-6 text-white text-center",children:[(0,t.jsx)("i",{className:"fa-solid fa-certificate text-4xl mb-3 opacity-80"}),(0,t.jsx)("p",{className:"text-sm opacity-80",children:i.certificateNumber})]}),(0,t.jsxs)("div",{className:"p-5",children:[(0,t.jsx)("h3",{className:"font-bold text-gray-900 mb-2",children:i.course.title}),(0,t.jsxs)("p",{className:"text-sm text-gray-500 mb-1",children:["المدرب: ",i.course.instructor]}),(0,t.jsxs)("p",{className:"text-sm text-gray-500 mb-4",children:["تاريخ الإصدار: ",new Date(i.issuedAt).toLocaleDateString("ar-EG")]}),(0,t.jsxs)("button",{onClick:()=>{let t;(t=window.open("","_blank"))&&(t.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>شهادة - ${i.certificateNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          body { margin: 0; padding: 40px; font-family: 'Cairo', sans-serif; background: #f5f5f5; }
          .certificate { width: 800px; margin: 0 auto; background: white; padding: 60px; border: 3px solid #4f46e5; border-radius: 12px; text-align: center; position: relative; }
          .certificate::before { content: ''; position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; border: 1px solid #c7d2fe; border-radius: 8px; }
          .logo { font-size: 28px; font-weight: 700; color: #4f46e5; margin-bottom: 10px; }
          .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 20px; }
          .name { font-size: 32px; font-weight: 700; color: #4f46e5; margin: 20px 0; padding: 10px 0; border-bottom: 2px solid #e5e7eb; display: inline-block; }
          .course { font-size: 18px; color: #374151; margin: 20px 0; }
          .details { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .detail { text-align: center; }
          .detail-label { font-size: 12px; color: #9ca3af; }
          .detail-value { font-size: 14px; font-weight: 600; color: #374151; }
          @media print { body { background: white; } .certificate { border: 3px solid #4f46e5; } }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="logo">مسار أكاديمي</div>
          <div class="subtitle">Masar Academy</div>
          <div class="title">شهادة إتمام دورة تدريبية</div>
          <p style="color: #6b7280;">تُشهد بأن</p>
          <div class="name">${e?.name||""}</div>
          <p style="color: #6b7280;">لقد أتم بنجاح دورة</p>
          <div class="course">${i.course.title}</div>
          <div class="details">
            <div class="detail">
              <div class="detail-label">رقم الشهادة</div>
              <div class="detail-value">${i.certificateNumber}</div>
            </div>
            <div class="detail">
              <div class="detail-label">تاريخ الإصدار</div>
              <div class="detail-value">${new Date(i.issuedAt).toLocaleDateString("ar-EG")}</div>
            </div>
            <div class="detail">
              <div class="detail-label">المدرب</div>
              <div class="detail-value">${i.course.instructor}</div>
            </div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `),t.document.close())},className:"w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition",children:[(0,t.jsx)("i",{className:"fa-solid fa-download ml-1"})," طباعة الشهادة"]})]})]},i.id))})]})]}):(0,t.jsx)("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center",children:(0,t.jsx)("p",{children:"يرجى تسجيل الدخول"})})}])}]);