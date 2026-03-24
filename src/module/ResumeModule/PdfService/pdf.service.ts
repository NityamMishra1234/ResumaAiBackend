import { Injectable } from "@nestjs/common";
import * as puppeteer from "puppeteer";

@Injectable()
export class PdfService {

  async generatePdf(data: any, template: string): Promise<Buffer> {

    //  Safety: ensure object
    const parsedData =
      typeof data === "string" ? JSON.parse(data) : data;

    const html = this.getTemplate(template, parsedData);

    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    return Buffer.from(pdf);
  }

  private getTemplate(template: string, data: any) {
    return `
  <html>
    <head>
      <style>
        body {
          font-family: 'Helvetica', sans-serif;
          margin: 40px;
          color: #111;
        }

        .header {
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .name {
          font-size: 28px;
          font-weight: bold;
        }

        .contact {
          font-size: 12px;
          color: #444;
        }

        h2 {
          font-size: 16px;
          margin-top: 20px;
          border-bottom: 1px solid #ccc;
        }

        .item {
          margin-bottom: 10px;
        }

        .title {
          font-weight: bold;
        }

        ul {
          margin: 5px 0;
          padding-left: 20px;
        }

        li {
          font-size: 13px;
          margin-bottom: 3px;
        }
      </style>
    </head>

    <body>

      <div class="header">
        <div class="name">${data.fullName}</div>
        <div class="contact">
          ${data.email} | ${data.phone} <br/>
          ${data.linkedin || ""} ${data.github || ""}
        </div>
      </div>

      <h2>Summary</h2>
      <p>${data.summary}</p>

      <h2>Skills</h2>
      <p>${(data.skills || []).join(", ")}</p>

      <h2>Experience</h2>
      ${(data.experience || [])
        .map(
          (e: any) => `
          <div class="item">
            <div class="title">${e.role} - ${e.company}</div>
            <div>${e.duration}</div>
            <ul>
              ${(e.points || [])
              .map((p: any) => `<li>${p}</li>`)
              .join("")}
            </ul>
          </div>
        `
        )
        .join("")}

      <h2>Projects</h2>
      ${(data.projects || [])
        .map(
          (p: any) => `
          <div class="item">
            <div class="title">${p.title}</div>
            <div>${p.description}</div>
            <ul>
              ${(p.points || [])
              .map((pt: any) => `<li>${pt}</li>`)
              .join("")}
            </ul>
          </div>
        `
        )
        .join("")}

      <h2>Education</h2>
      ${(data.education || [])
        .map(
          (e: any) => `
          <div class="item">
            <div class="title">${e.degree}</div>
            <div>${e.institution}</div>
            <div>${e.duration}</div>
          </div>
        `
        )
        .join("")}

    </body>
  </html>
  `;
  }
}