import puppeteer from 'puppeteer-core';
import pptxgen from "pptxgenjs"
import fs from "fs/promises"
import path from "path"

/// your project name
const projectName = "Project Name"
/// your patentcloud logined session
const session = `fb6b7d10-e4a8-420d-c692-notwork12092`
/// your statistics-chart page
const url = `https://app.patentcloud.com/statistics-chart.html?q=Project+Name`


/// pack keywords
/// [name, vue-i18n-txt]
/// Name: Custom Output Name
/// vue-i18n-txt: statistics-chart page search options attr (use Devtools)
const keywords: [string, string][] = [
  ["標準專利權人", "dd.statistics.fields.docdbAssigneesNormalFacetname"],
  ["當前專利權人", "dd.statistics.fields.currentAssigneesNormalFacetname"],
  ["標準發明人", "dd.statistics.fields.docdbInventorsNormalFacetname"],
  ["代理機構", "dd.statistics.fields.agentsFacetname"],
  ["審查委員", "dd.statistics.fields.examinerMastersFacetname"],
  ["出讓人", "dd.statistics.fields.assignmentAssignorsNormalFacetname"],
  ["受讓人", "dd.statistics.fields.assignmentAssigneesNormalFacetname"],
  ["轉讓代理機構", "dd.statistics.fields.assignmentCorrespondentNamesFacetname"],
  ["授權人", "dd.statistics.fields.assignmentLicensorsNormalFacetname"],
  ["被授權人", "dd.statistics.fields.assignmentLicenseesNormalFacetname"],
  ["質押申請人", "dd.statistics.fields.assignmentMortgageApplicantsNormalFacetname"],
  ["質押債權人", "dd.statistics.fields.assignmentMortgageCreditorsNormalFacetname"],
  ["優先權日", "dd.statistics.fields.priorityFilingYear"],
  ["申請日", "dd.statistics.fields.appYear"],
  ["公告日", "dd.statistics.fields.decisionYear"],
  ["公開日", "dd.statistics.fields.openYear"],
  ["放棄日", "dd.statistics.fields.abandonmentYear"],
  ["預估屆滿日", "dd.statistics.fields.expectedExpirationYear"],
  ["轉讓日", "dd.statistics.fields.assignmentAssigneeYears"],
  ["授權日", "dd.statistics.fields.assignmentLicenseeYears"],
  ["質押日", "dd.statistics.fields.assignmentMortgageApplicantYears"],
  ["專利價值", "dd.statistics.fields.rankV"],
  ["專利品質", "dd.statistics.fields.rankQ"],
  ["主要IPC", "export.mainIPCNormal"],
  ["IPC (小類)", "dd.statistics.fields.ipcsSubClass"],
  ["IPC (階層)", "dd.statistics.fields.ipcsClass"],
  ["主要CPC", "export.mainCPCNormal"],
  ["CPC (小類)", "dd.statistics.fields.cpcsSubClass"],
  ["CPC (階層)", "dd.statistics.fields.cpcsClass"],
  ["主要USPC", "export.mainUSPC"],
  ["USPC", "dd.statistics.fields.uspcs"],
  ["FI (小類)", "dd.statistics.fields.fisSubClass"],
  ["FI (階層)", "dd.statistics.fields.fisClass"],
  ["F-term", "dd.statistics.fields.fterms"],
  ["主要 LOC", "export.mainLOC"],
  ["Locarno", "dd.statistics.fields.locs"],
  ["專利類型", "dd.statistics.fields.typeCode"],
  ["專利局", "dd.statistics.fields.country"],
  ["最早優先權國家", "dd.statistics.earliestPriorityCountry"],
  ["國家階段子案國家", "dd.statistics.NPChild"],
  ["當前狀態", "dd.statistics.fields.statusCode"],
  ["有效中", "dd.statistics.fields.statusCode_3"],
  ["撤銷", "dd.statistics.fields.statusCode_6"],
  ["再領證失效", "dd.statistics.fields.statusCode_8"],
  ["申請中", "dd.statistics.fields.statusCode_1"],
  ["審查中", "dd.statistics.fields.statusCode_2"],
  ["放棄", "dd.statistics.fields.statusCode_4"],
  ["期限屆滿", "dd.statistics.fields.statusCode_5"],
  ["PCT屆期-國家階段", "dd.statistics.fields.statusCode_9"],
  ["轉讓", "dd.statistics.fields.assignmentAssigneeFlag"],
  ["轉讓次數", "dd.statistics.fields.assignmentAssigneeCount"],
  ["專利授權", "dd.statistics.fields.assignmentLicenseeFlag"],
  ["專利質押", "dd.statistics.fields.assignmentMortgageApplicantFlag"],
  ["請求項數量", "field.claimCnt"],
  ["獨立請求項數量", "field.indepClaimCnt"],
  ["訴訟案號 (ID)", "field.litigationCaseNumbers"],
  ["訴訟次數", "field.litigationTotalCount"],
  ["法院類型", "field.litigationCourtType"],
  ["訴訟類型", "field.litigationPleadingType"],
  ["訴訟狀態", "field.litigationCaseStatus"]
]

/// browser executable path
const executablePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
/// enable browser headless
const headless = true

//==========================================================================================
// App
//==========================================================================================
  ; (async () => {

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
      headless: headless && "new",
      executablePath,
    });

    await thread(keywords)
    await browser.close()
    console.log("all finished")

    async function thread(list: [string, string][]) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1600, height: 1200 });
      await page.setCookie({ name: "SESSION", value: session, domain: "app.patentcloud.com" })
      await page.goto(url);
      await page.waitForSelector("#sel-data-list1")

      let closeSelectData = false
      for (const [name, id] of list) {
        console.log(`catch "${name}" data`)
        const selector = `#sel-data-list1 :not(#itemdateMonth1) [vue-i18n-txt='${id}']`
        await page.evaluate(`document.querySelector("${selector}").click()`)
        await page.click(`[vue-i18n-txt="system.txt.start"]`)
        await page.waitForNetworkIdle({ idleTime: 300 })

        await page.evaluate(`document.querySelector('[vue-i18n-txt="page.statistics.showAllValue"]').click()`)
        if (!closeSelectData) {
          await page.evaluate(`document.getElementById("selectDataRightSider").remove()`)
          closeSelectData = true
        }

        await new Promise(r => setTimeout(r, 3000));

        //download screenshot
        await fs.mkdir("./data/" + name, { recursive: true })
        await page.screenshot({ path: `./data/${name}/screenshot.png` })
        await page.evaluate(`document.querySelector('[vue-i18n-txt="page.statistics.showAllValue"]').click()`)

        //download CSV
        await (await page.target().createCDPSession()).send('Page.setDownloadBehavior', {
          downloadPath: path.resolve(`data/${name}/`),
          behavior: 'allow',
        })
        await page.waitForXPath("//span[contains(., 'CSV')]")
        await page.evaluate(`document.evaluate("//span[contains(., 'CSV')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()`)

        await page.waitForNetworkIdle({ idleTime: 1000 })
      }
      await page.close()
    }

    let pres = new pptxgen();
    for (const keyword of keywords) await createSlide(keyword[0])
    await pres.writeFile({ fileName: `${projectName}.pptx` })


    async function createSlide(name: string) {
      let slide = pres.addSlide();
      const data = (await fs.readFile(`./data/${name}/` + (await fs.readdir(`./data/${name}`)).filter(v => v.endsWith(".csv"))[0], "utf-8")).replace(/^.*\n/, "").split("\n").map(v => v.split(",")) as [string, string][]
      slide.addText(`在${projectName}專利中${name}如下;` + data.map(([name, items]) => `在${name}總共有${items}件`).join(";"), {
        valign: "top",
        align: "left",
        w: "100%",
        x: 0,
        y: 0,
      });
      slide.background = { path: `./data/${name}/screenshot.png` };
    }
  })()