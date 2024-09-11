import React, { useState } from 'react';
import { Play, RotateCcw, Volume2, User } from 'lucide-react';

const tabs = [
  { id: 'zen', label: 'Thiền', icon: '☯️' },
  { id: 'chatbot', label: 'Thiền Sư', icon: '🧘' },
  { id: 'quest', label: 'Nhiệm Vụ', icon: '🏆' },
  { id: 'setup', label: 'Cài Đặt', icon: '⚙️' }
];

export default function MeditationApp() {
  const [activeTab, setActiveTab] = useState('zen');
  const [time, setTime] = useState(600);
  const [sliderValue, setSliderValue] = useState(10);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    setTime(value * 60);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Namo.vn</h1>
        <button className="p-2">
          <User className="h-6 w-6" />
        </button>
      </header>

      <main className="container mx-auto p-4">
        {activeTab === 'zen' && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-gray-900">
            <div className="text-7xl font-bold text-center mb-4">
              {formatTime(time)}
            </div>
            <div className="text-center mb-4">
              <span className="text-xl">Sẵn sàng thư giãn chưa? 🧘‍♂️</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>5p</span>
              <span>10p</span>
              <span>15p</span>
              <span>20p</span>
              <span>30p</span>
            </div>
            <div className="text-center text-sm text-gray-600 mb-4">
              10 phút để tái tạo năng lượng và sự tập trung ☀️
            </div>
            <div className="text-center text-sm text-gray-600 italic mb-6">
              "The present moment is the only time over which we have dominion. - Thích Nhất Hạnh"
            </div>
            <div className="flex justify-around items-center">
              <button className="p-4 rounded-full bg-white shadow">
                <RotateCcw className="h-6 w-6 text-gray-600" />
              </button>
              <button className="p-6 rounded-full bg-black text-white shadow">
                <Play className="h-8 w-8" />
              </button>
              <button className="p-4 rounded-full bg-white shadow">
                <Volume2 className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-gray-900">
            <h2 className="text-2xl font-bold text-center mb-4">Thiền Sư</h2>
            <p className="text-center mb-4">Tâm trạng của bạn hôm nay thế nào?</p>
            <div className="flex justify-center space-x-2">
              {['😊', '😐', '😔', '😄', '😢', '😡', '😍'].map((emoji) => (
                <button key={emoji} className="text-3xl p-2 hover:bg-gray-200 rounded">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quest' && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-gray-900">
            <h2 className="text-2xl font-bold text-center mb-4">Nhiệm Vụ</h2>
            <p className="text-center mb-4">Tổng Điểm: 100</p>
            <div className="space-y-4">
              <h3 className="font-semibold">Phần Thưởng Khả Dụng</h3>
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-medium">Khóa học thiền nâng cao</h4>
                <p className="text-sm text-gray-600">Mở khóa nội dung thiền nâng cao</p>
                <p className="text-sm">Phần Thưởng: 500 points</p>
                <button className="mt-2 px-4 py-2 bg-gray-300 rounded">Đổi Điểm</button>
              </div>
              {/* Add more rewards here */}
              <h3 className="font-semibold">Nhiệm Vụ Hàng Ngày</h3>
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-medium">Thiền 5 phút</h4>
                <p className="text-sm text-gray-600">Hoàn thành một phiên thiền 5 phút</p>
                <p className="text-sm">Tiến Độ: 0/1</p>
                <p className="text-sm">Phần Thưởng: 10 points</p>
                <button className="mt-2 px-4 py-2 bg-black text-white rounded">Hoàn Thành</button>
              </div>
              {/* Add more quests here */}
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-gray-900">
            <h2 className="text-2xl font-bold text-center mb-4">Tùy Chỉnh Ứng Dụng ⚙️</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Thông Tin Cá Nhân</h3>
                {/* Add personal info fields here */}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Tùy Chọn</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block mb-1">Giao Diện</label>
                    <div className="space-x-2">
                      <label className="inline-flex items-center">
                        <input type="radio" name="theme" value="light" className="form-radio" />
                        <span className="ml-2">Sáng</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="radio" name="theme" value="dark" className="form-radio" />
                        <span className="ml-2">Tối</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="radio" name="theme" value="system" className="form-radio" />
                        <span className="ml-2">Hệ Thống</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Thông Báo 🔔</span>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Nhắc Nhở Hàng Ngày ⏰</span>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div>
                    <label className="block mb-1">Ngôn Ngữ</label>
                    <select className="form-select w-full">
                      <option>Tiếng Việt</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              </div>
              <button className="w-full bg-black text-white py-2 rounded">Lưu Cài Đặt</button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 flex flex-col items-center ${activeTab === tab.id ? 'text-black' : 'text-gray-500'}`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}