module.exports=[88125,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(51335),e=a.i(38679),f=a.i(38246);a.s(["default",0,function(){let{user:a}=(0,d.useAuth)(),[g,h]=(0,c.useState)([]),[i,j]=(0,c.useState)(!0);(0,c.useEffect)(()=>{a&&k()},[a]);let k=async()=>{try{let a=localStorage.getItem("accessToken"),b=await fetch("/api/student/certificates",{headers:{Authorization:`Bearer ${a}`}}),c=await b.json();c.success&&h(c.data.certificates)}catch(a){console.error(a)}j(!1)};return a?(0,b.jsxs)("div",{className:"min-h-screen bg-gray-50",dir:"rtl",children:[(0,b.jsx)(e.default,{}),(0,b.jsxs)("main",{className:"max-w-4xl mx-auto px-4 py-8",children:[(0,b.jsx)("h1",{className:"text-2xl font-bold text-gray-900 mb-2",children:"شهاداتي"}),(0,b.jsx)("p",{className:"text-gray-500 mb-8",children:"الشهادات التي حصلت عليها من الكورسات المكتملة"}),i?(0,b.jsx)("div",{className:"text-center py-20 text-gray-400",children:"جاري التحميل..."}):0===g.length?(0,b.jsxs)("div",{className:"text-center py-20 bg-white rounded-xl border",children:[(0,b.jsx)("i",{className:"fa-solid fa-certificate text-5xl text-gray-300 mb-4"}),(0,b.jsx)("p",{className:"text-gray-500 font-semibold",children:"لا توجد شهادات بعد"}),(0,b.jsx)("p",{className:"text-gray-400 text-sm mt-1",children:"أكمل كورساً للحصول على شهادة"}),(0,b.jsx)(f.default,{href:"/courses",className:"inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700",children:"تصفح الكورسات"})]}):(0,b.jsx)("div",{className:"grid md:grid-cols-2 gap-6",children:g.map(c=>(0,b.jsxs)("div",{className:"bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition",children:[(0,b.jsxs)("div",{className:"bg-gradient-to-l from-indigo-600 to-purple-600 p-6 text-white text-center",children:[(0,b.jsx)("i",{className:"fa-solid fa-certificate text-4xl mb-3 opacity-80"}),(0,b.jsx)("p",{className:"text-sm opacity-80",children:c.certificateNumber})]}),(0,b.jsxs)("div",{className:"p-5",children:[(0,b.jsx)("h3",{className:"font-bold text-gray-900 mb-2",children:c.course.title}),(0,b.jsxs)("p",{className:"text-sm text-gray-500 mb-1",children:["المدرب: ",c.course.instructor]}),(0,b.jsxs)("p",{className:"text-sm text-gray-500 mb-4",children:["تاريخ الإصدار: ",new Date(c.issuedAt).toLocaleDateString("ar-EG")]}),(0,b.jsxs)("button",{onClick:()=>{let b;(b=window.open("","_blank"))&&(b.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>شهادة - ${c.certificateNumber}</title>
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
          <div class="name">${a?.name||""}</div>
          <p style="color: #6b7280;">لقد أتم بنجاح دورة</p>
          <div class="course">${c.course.title}</div>
          <div class="details">
            <div class="detail">
              <div class="detail-label">رقم الشهادة</div>
              <div class="detail-value">${c.certificateNumber}</div>
            </div>
            <div class="detail">
              <div class="detail-label">تاريخ الإصدار</div>
              <div class="detail-value">${new Date(c.issuedAt).toLocaleDateString("ar-EG")}</div>
            </div>
            <div class="detail">
              <div class="detail-label">المدرب</div>
              <div class="detail-value">${c.course.instructor}</div>
            </div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `),b.document.close())},className:"w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition",children:[(0,b.jsx)("i",{className:"fa-solid fa-download ml-1"})," طباعة الشهادة"]})]})]},c.id))})]})]}):(0,b.jsx)("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center",children:(0,b.jsx)("p",{children:"يرجى تسجيل الدخول"})})}])}];

//# sourceMappingURL=app_student_certificates_page_tsx_0xwnyvd._.js.map