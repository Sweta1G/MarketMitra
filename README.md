# Envest Portfolio - Smart News + Portfolio Insights

A comprehensive web application that automates stock market news curation for Indian markets and provides AI-powered portfolio insights.

## 🚀 Features

- **📰 News Scraping**: Automatically curates stock market news from Indian sources (MoneyControl, Economic Times)
- **💼 Portfolio Management**: Create and manage your stock portfolio with popular Indian stocks
- **🤖 AI Analysis**: OpenAI-powered sentiment analysis and market insights
- **🎯 Filtered News**: Shows only news relevant to your portfolio holdings
- **📊 Real-time Updates**: Live news updates with refresh functionality
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-3.5 Turbo
- **Scraping**: Cheerio, Axios
- **Icons**: Lucide React

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd envest-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How to Use

1. **Create Portfolio**: Add your stock symbols (e.g., TCS, INFY, RELIANCE)
2. **View News**: Check general market news and portfolio-specific news
3. **AI Insights**: Get AI-powered sentiment analysis and impact assessment
4. **Stay Updated**: Use the refresh button for latest news and analysis

## 📊 Supported Stocks

The application supports major Indian stocks including:
- TCS, INFY, WIPRO (IT Sector)
- HDFCBANK, ICICIBANK, SBIN (Banking)
- RELIANCE, ITC (Conglomerates)
- MARUTI, TATAMOTORS (Auto)
- And many more BSE/NSE listed companies

## 🔧 API Endpoints

- `GET /api/news` - Fetch latest market news
- `GET /api/portfolio` - Get user portfolios
- `POST /api/portfolio` - Create new portfolio
- `PUT /api/portfolio` - Update portfolio
- `POST /api/analyze` - AI analysis of news sentiment

## 🌟 Key Components

- **Header**: Navigation and branding
- **PortfolioSection**: Portfolio management interface
- **NewsSection**: News display with filtering
- **AnalysisSection**: AI-powered insights and sentiment analysis

## 🔮 Future Enhancements

- Real broker API integration (Zerodha Kite, Groww)
- Push notifications for significant market moves
- Historical sentiment tracking
- More Indian news sources
- Email alerts for portfolio-specific news
- Price charts and technical indicators

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This application is for informational purposes only and should not be considered as financial advice. Please consult with a qualified financial advisor before making investment decisions.
