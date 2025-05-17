import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Business from '../../models/Business';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      const { websiteIdentifier } = req.query;
      if (websiteIdentifier && typeof websiteIdentifier === 'string') {
        const businesses = await Business.find({ WebsiteIdentifier: websiteIdentifier }).lean();
        return res.status(200).json(businesses);
      }
      const businesses = await Business.find({}).limit(10).lean();
      return res.status(200).json(businesses);
    }

    if (req.method === 'POST') {
      const businessData = req.body;

      if (!businessData.WebsiteIdentifier || !businessData.business?.name || !businessData.business?.businessId) {
        return res.status(400).json({ message: 'WebsiteIdentifier, business name, and business ID are required' });
      }

      const existingBusiness = await Business.findOne({ 'business.businessId': businessData.business.businessId });
      if (existingBusiness && existingBusiness.WebsiteIdentifier !== businessData.WebsiteIdentifier) {
        return res.status(409).json({ message: 'Business ID already exists' });
      }

      const existingWebsite = await Business.findOne({ WebsiteIdentifier: businessData.WebsiteIdentifier });
      if (existingWebsite) {
        return res.status(409).json({ message: 'WebsiteIdentifier already exists' });
      }

      const business = new Business(businessData);
      await business.save();

      try {
        const filePath = path.join(process.cwd(), 'src/data/data.json');
        let jsonData;
        try {
          jsonData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        } catch (error) {
          jsonData = { listings: {} };
        }
        jsonData.listings[businessData.WebsiteIdentifier] = businessData;
        await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
      } catch (jsonErr) {
        console.error('Error updating data.json:', jsonErr);
      }

      return res.status(201).json({ message: 'Business created successfully', data: business });
    }

    if (req.method === 'PUT') {
      const { websiteIdentifier } = req.query;
      const businessData = req.body;

      if (!websiteIdentifier || typeof websiteIdentifier !== 'string') {
        return res.status(400).json({ message: 'WebsiteIdentifier is required' });
      }

      if (!businessData.WebsiteIdentifier || !businessData.business?.name || !businessData.business?.businessId) {
        return res.status(400).json({ message: 'WebsiteIdentifier, business name, and business ID are required' });
      }

  
      const existingBusiness = await Business.findOne({
        'business.businessId': businessData.business.businessId,
        WebsiteIdentifier: { $ne: websiteIdentifier },
      });
      if (existingBusiness) {
        return res.status(409).json({ message: 'Business ID already exists for another listing' });
      }

      
      const updatedBusiness = await Business.findOneAndUpdate(
        { WebsiteIdentifier: websiteIdentifier },
        businessData,
        { new: true, upsert: true } 
      );

      try {
        const filePath = path.join(process.cwd(), 'src/data/data.json');
        let jsonData;
        try {
          jsonData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        } catch (error) {
          jsonData = { listings: {} };
        }
        jsonData.listings[websiteIdentifier] = businessData;
        await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
      } catch (jsonErr) {
        console.error('Error updating data.json:', jsonErr);
      }

      return res.status(200).json({ message: 'Business updated successfully', data: updatedBusiness });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('Error processing request:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}