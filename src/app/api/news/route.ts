import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface NewsItem {
  title: string;
  url: string;
  summary: string;
  timestamp: string;
  source: string;
}

// News sources configuration (for future implementation)
/*
const NEWS_SOURCES = {
  moneycontrol: {
    url: 'https://www.moneycontrol.com/news/business/markets/',
    titleSelector: '.commen_title',
    linkSelector: 'a',
    summarySelector: '.news_intro',
  },
  economictimes: {
    url: 'https://economictimes.indiatimes.com/markets',
    titleSelector: '.eachStory h3 a',
    linkSelector: 'a',
    summarySelector: '.eachStory p',
  }
};
*/

async function scrapeMoneyControl(): Promise<NewsItem[]> {
  try {
    // Try market-specific RSS feed
    const rssResponse = await axios.get('https://www.moneycontrol.com/rss/business.xml', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(rssResponse.data, { xmlMode: true });
    const news: NewsItem[] = [];
    
    $('item').slice(0, 6).each((index, element) => {
      const $element = $(element);
      const title = $element.find('title').text().trim();
      const url = $element.find('link').text().trim();
      const description = $element.find('description').text().replace(/<[^>]*>/g, '').trim();
      const pubDate = $element.find('pubDate').text().trim();
      
      // Filter for stock market related news only
      const stockKeywords = ['stock', 'market', 'sensex', 'nifty', 'share', 'equity', 'trading', 'bse', 'nse', 'investment', 'mutual fund', 'ipo', 'listing', 'earnings', 'results', 'quarterly', 'financial', 'banking', 'sector'];
      const titleLower = title.toLowerCase();
      const isStockRelated = stockKeywords.some(keyword => titleLower.includes(keyword));
      
      if (title && url && isStockRelated && description && description.length > 10) {
        news.push({
          title: title,
          url: url,
          summary: description,
          timestamp: pubDate || new Date().toISOString(),
          source: "MoneyControl"
        });
      }
    });
    
    return news;
  } catch (error) {
    console.error('Error scraping MoneyControl:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

async function scrapeEconomicTimes(): Promise<NewsItem[]> {
  try {
    // Try market-specific RSS feed
    const rssResponse = await axios.get('https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(rssResponse.data, { xmlMode: true });
    const news: NewsItem[] = [];
    
    $('item').slice(0, 5).each((index, element) => {
      const $element = $(element);
      const title = $element.find('title').text().trim();
      const url = $element.find('link').text().trim();
      const description = $element.find('description').text().replace(/<[^>]*>/g, '').trim();
      const pubDate = $element.find('pubDate').text().trim();
      
      // Filter for stock market related news only
      const stockKeywords = ['stock', 'market', 'sensex', 'nifty', 'share', 'equity', 'trading', 'bse', 'nse', 'investment', 'mutual fund', 'ipo', 'listing', 'earnings', 'results', 'quarterly', 'financial', 'banking', 'sector', 'fii', 'dii'];
      const titleLower = title.toLowerCase();
      const isStockRelated = stockKeywords.some(keyword => titleLower.includes(keyword));
      
      if (title && url && isStockRelated && description && description.length > 10) {
        news.push({
          title: title,
          url: url,
          summary: description,
          timestamp: pubDate || new Date().toISOString(),
          source: "Economic Times"
        });
      }
    });
    
    return news;
  } catch (error) {
    console.error('Error scraping Economic Times:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

async function fetchNewsAPI(): Promise<NewsItem[]> {
  try {
    // Using NewsAPI.org for STOCK MARKET specific news only
    const apiKey = process.env.NEWS_API_KEY || 'demo';
    
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: '("indian stock market" OR "sensex" OR "nifty 50" OR "BSE" OR "NSE") AND NOT (ukraine OR russia OR trump OR politics OR war)',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 5,
        apiKey: apiKey,
        domains: 'economictimes.com,moneycontrol.com,business-standard.com,livemint.com'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
      }
    });

    if (response.data && response.data.articles) {
      const filteredArticles = response.data.articles.filter((article: {
        title?: string;
        description?: string;
      }) => {
        const title = article.title?.toLowerCase() || '';
        const description = article.description?.toLowerCase() || '';
        
        // Stock market keywords
        const stockKeywords = ['stock', 'market', 'sensex', 'nifty', 'share', 'equity', 'trading', 'bse', 'nse', 'investment', 'earnings', 'financial'];
        
        // Exclude non-stock keywords
        const excludeKeywords = ['ukraine', 'russia', 'trump', 'politics', 'war', 'election', 'covid', 'weather'];
        
        const hasStockKeyword = stockKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
        const hasExcludeKeyword = excludeKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
        
        return hasStockKeyword && !hasExcludeKeyword;
      });

      return filteredArticles.map((article: {
        title: string;
        url: string;
        description?: string;
        publishedAt: string;
        source: { name: string };
      }) => ({
        title: article.title,
        url: article.url,
        summary: article.description?.replace(/<[^>]*>/g, '') || 'Click to read the full article.',
        timestamp: article.publishedAt,
        source: article.source.name
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';

    let news: NewsItem[] = [];

    // Fetch from multiple sources in parallel for better performance
    const promises: Promise<NewsItem[]>[] = [];

    if (source === 'all' || source === 'moneycontrol') {
      promises.push(scrapeMoneyControl());
    }

    if (source === 'all' || source === 'economictimes') {
      promises.push(scrapeEconomicTimes());
    }

    if (source === 'all' || source === 'newsapi') {
      promises.push(fetchNewsAPI());
    }

    // Execute all promises and collect results
    const results = await Promise.allSettled(promises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        news = [...news, ...result.value];
      }
    });

    // If no news from scraping, use NewsAPI as fallback
    if (news.length === 0) {
      try {
        const apiNews = await fetchNewsAPI();
        news = [...news, ...apiNews];
      } catch (error) {
        console.error('Fallback NewsAPI also failed:', error);
      }
    }

    // Remove duplicates and filter out non-stock news
    const stockKeywords = ['stock', 'market', 'sensex', 'nifty', 'share', 'equity', 'trading', 'bse', 'nse', 'investment', 'earnings', 'financial', 'banking', 'sector', 'ipo', 'listing', 'mutual fund'];
    const excludeKeywords = ['ukraine', 'russia', 'trump', 'politics', 'war', 'election', 'covid', 'weather', 'ceasefire', 'putin', 'biden'];
    
    const filteredNews = news.filter((item) => {
      const titleLower = item.title.toLowerCase();
      const summaryLower = item.summary.toLowerCase();
      const text = `${titleLower} ${summaryLower}`;
      
      const hasStockKeyword = stockKeywords.some(keyword => text.includes(keyword));
      const hasExcludeKeyword = excludeKeywords.some(keyword => text.includes(keyword));
      
      // Only include news with proper content (no garbage)
      const hasValidContent = item.summary.length > 20 && 
                             !item.summary.includes('undefined') &&
                             !item.summary.includes('null') &&
                             !item.summary.includes('{}') &&
                             !item.summary.includes('[]') &&
                             !item.title.includes('undefined');
      
      return hasStockKeyword && !hasExcludeKeyword && hasValidContent;
    });

    const uniqueNews = filteredNews.filter((item, index, self) => 
      index === self.findIndex(other => 
        item.title.toLowerCase().substring(0, 50) === other.title.toLowerCase().substring(0, 50)
      )
    );

    // Sort by timestamp (newest first)
    uniqueNews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to 20 articles total
    const limitedNews = uniqueNews.slice(0, 20);

    return NextResponse.json({
      success: true,
      data: limitedNews,
      count: limitedNews.length,
      timestamp: new Date().toISOString(),
      sources: ['MoneyControl', 'Economic Times', 'NewsAPI']
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news',
        data: [],
        count: 0
      },
      { status: 500 }
    );
  }
}
