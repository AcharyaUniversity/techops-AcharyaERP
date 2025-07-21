import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
  pageLayout: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    margin: "20px 10px 20px 40px",
    paddingBottom: 10,
  },
  table: {
    display: "table",
    width: "95%",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#000",
  },
  row: {
    flexDirection: "row",
    borderColor: "#000",
  },
  subjectSection: {
    marginBottom: "10px",
    display: "flex",
    flexDirection: "row",
    width: "95%",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 3,
  },
  cellWidth: { width: "33.33%", display: "flex", flexDirection: "row" },
  subjectRow: {
    display: "flex",
    flexDirection: "row",
    gap: 2,
  },
  boldText: { fontFamily: "Times-Bold" },
  normalText: { fontFamily: "Times-Roman" },
  centerAlign: {
    justifyContent: "center",
  },
  rightAlign: {
    justifyContent: "flex-end",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    width: "95%",
    textAlign: "center",
    paddingVertical: 5,
  },
});

const signatureList = [
  "Faculty Signature",
  "HOD Signature",
  "Principal Signature",
];

export const GenerateDetailedAttendanceReport = async (
  data,
  pages,
  isDetailed
) => {
  let count = 0;
  const CustomRow = ({ children }) => (
    <View style={styles.row}>{children}</View>
  );

  const CustomCell = ({
    label,
    borderRight,
    borderBottom,
    fontFamily,
    width,
    align = "center",
    color = "transparent",
  }) => (
    <Text
      style={{
        padding: 3,
        borderRightWidth: borderRight,
        borderBottomWidth: borderBottom,
        borderColor: "#000",
        fontFamily,
        width: `${width}%`,
        textAlign: align,
        textTransform: "capitalize",
        backgroundColor: color,
      }}
    >
      {label}
    </Text>
  );

  const AttendanceReport = ({ pageData }) => {
    const { columns, rows } = pageData;
    return (
      <View>
        <View style={styles.table}>
          <CustomRow>
            <CustomCell
              label="Sl No."
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={2}
            />
            <CustomCell
              label="AUID"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={7}
            />
            <CustomCell
              label="USN"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={4}
            />
            <CustomCell
              label="Student Name"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={11}
            />
            <CustomCell
              label="DOR"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={5}
            />
            <CustomCell
              label="Section/Batch"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={5}
            />
            {columns.map((_, i) => {
              count = data.sortedDates.length === count ? 1 : count + 1;
              return (
                <CustomCell
                  key={i}
                  label={count}
                  borderRight={i === columns.length - 1 ? 0 : 0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Bold"
                  width={67 / columns.length}
                />
              );
            })}
          </CustomRow>
          {rows.map((obj, i) => {
            return (
              <CustomRow key={i}>
                <CustomCell
                  label={i + 1}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={2}
                />
                <CustomCell
                  label={obj.auid}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={7}
                />
                <CustomCell
                  label={obj.usn}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={4}
                />
                <CustomCell
                  label={obj.student_name.toLowerCase()}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={11}
                  align="left"
                />
                <CustomCell
                  label={
                    obj.reporting_date
                      ? moment(obj.reporting_date).format("DD-MM-YYYY")
                      : ""
                  }
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={5}
                />
                <CustomCell
                  label={obj.section_name ? obj.section_name : obj.batch_name}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={5}
                  align="left"
                />
                {columns.map((item, j) => (
                  <CustomCell
                    key={j}
                    label={
                      data.displayData[
                        `${item.date}-${item.id}-${obj.student_id}`
                      ]
                    }
                    borderRight={j === columns.length - 1 ? 0 : 0.5}
                    borderBottom={0.5}
                    fontFamily="Times-Roman"
                    width={67 / columns.length}
                    color={
                      data.displayData[
                        `${item.date}-${item.id}-${obj.student_id}`
                      ] === "A"
                        ? "#ef9a9a"
                        : "transparent"
                    }
                  />
                ))}
              </CustomRow>
            );
          })}
          <CustomRow>
            <CustomCell
              label="Present Count/Total Count"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={34}
              align="left"
            />
            {columns.map((obj, i) => (
              <CustomCell
                key={i}
                label={data.totalCount[`${obj.date}-${obj.id}`]}
                borderRight={i === columns.length - 1 ? 0 : 0.5}
                borderBottom={0.5}
                fontFamily="Times-Bold"
                width={67 / columns.length}
              />
            ))}
          </CustomRow>
          <CustomRow>
            <CustomCell
              label="Date"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={34}
              align="left"
            />
            {columns.map((obj, i) => (
              <CustomCell
                key={i}
                label={`${obj.date}`}
                borderRight={i === columns.length - 1 ? 0 : 0.5}
                borderBottom={0.5}
                fontFamily="Times-Bold"
                width={67 / columns.length}
              />
            ))}
          </CustomRow>
          {signatureList.map((obj, i) => (
            <CustomRow key={i}>
              <Text
                style={{
                  padding: "8px 8px 8px 3px",
                  borderRightWidth: 0.5,
                  borderBottomWidth: i === signatureList.length - 1 ? 0 : 0.5,
                  borderColor: "#000",
                  fontFamily: "Times-Bold",
                  width: "34%",
                  textAlign: "left",
                  textTransform: "capitalize",
                }}
              >
                {obj}
              </Text>
              {columns.map((_, j) => (
                <Text
                  key={j}
                  style={{
                    padding: 3,
                    borderRightWidth: j === columns.length - 1 ? 0 : 0.5,
                    borderBottomWidth: i === signatureList.length - 1 ? 0 : 0.5,
                    borderColor: "#000",
                    fontFamily: "Times-Bold",
                    width: `${67 / columns.length}%`,
                    textAlign: "left",
                    textTransform: "capitalize",
                  }}
                />
              ))}
            </CustomRow>
          ))}
        </View>
      </View>
    );
  };

  const SummaryReport = ({ pageData }) => {
    const { rows } = pageData;
    return (
      <View>
        <View style={styles.table}>
          <CustomRow>
            <CustomCell
              label="Sl No."
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={3}
            />
            <CustomCell
              label="AUID"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={7}
            />
            <CustomCell
              label="USN"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={7}
            />
            <CustomCell
              label="Student Name"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={12}
            />
            <CustomCell
              label="DOR"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={5}
            />
            <CustomCell
              label="Section/Batch"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={10}
            />
            <CustomCell
              label="Present Count"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={19}
            />
            <CustomCell
              label="Class Count"
              borderRight={0.5}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={19}
            />
            <CustomCell
              label="Percentage"
              borderRight={0}
              borderBottom={0.5}
              fontFamily="Times-Bold"
              width={19}
            />
          </CustomRow>
          {rows.map((obj, i) => {
            return (
              <CustomRow key={i}>
                <CustomCell
                  label={i + 1}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={3}
                />
                <CustomCell
                  label={obj.auid}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={7}
                />
                <CustomCell
                  label={obj.usn}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={7}
                />
                <CustomCell
                  label={obj.student_name.toLowerCase()}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={12}
                  align="left"
                />
                <CustomCell
                  label={
                    obj.reporting_date
                      ? moment(obj.reporting_date).format("DD-MM-YYYY")
                      : ""
                  }
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={5}
                />
                <CustomCell
                  label={obj.section_name ? obj.section_name : obj.batch_name}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={10}
                  align="left"
                />
                <CustomCell
                  label={data.stdPresentCount[obj.student_id].count}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={19}
                />
                <CustomCell
                  label={data.stdPresentCount[obj.student_id].total_class}
                  borderRight={0.5}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={19}
                />
                <CustomCell
                  label={`${data.stdPresentCount[obj.student_id].percentage}%`}
                  borderRight={0}
                  borderBottom={0.5}
                  fontFamily="Times-Roman"
                  width={19}
                />
              </CustomRow>
            );
          })}
          {signatureList.map((obj, i) => (
            <CustomRow key={i}>
              <Text
                style={{
                  padding: "8px 8px 8px 3px",
                  borderRightWidth: 0,
                  borderBottomWidth: i === signatureList.length - 1 ? 0 : 0.5,
                  borderColor: "#000",
                  fontFamily: "Times-Bold",
                  width: "100%",
                  textAlign: "left",
                  textTransform: "capitalize",
                }}
              >
                {obj}
              </Text>
            </CustomRow>
          ))}
        </View>
      </View>
    );
  };

  const headings = () => (
    <View>
      <View style={{ marginBottom: "5px" }}>
        <Text
          style={{
            fontFamily: "Times-Bold",
            textAlign: "center",
            fontSize: 12,
          }}
        >
          {data.studentData[0].school_name}
        </Text>
      </View>
      <View style={{ marginBottom: "10px" }}>
        <Text
          style={{
            fontFamily: "Times-Bold",
            textAlign: "center",
            fontSize: 11,
          }}
        >
          {data.studentData[0].dept_name}
        </Text>
      </View>
      <View style={{ marginBottom: "10px" }}>
        <Text
          style={{
            fontFamily: "Times-Bold",
            textAlign: "center",
            fontSize: 11,
          }}
        >
          Student Attendance Report
        </Text>
      </View>
      <View style={styles.subjectSection}>
        <View style={styles.cellWidth}>
          <View style={styles.subjectRow}></View>
        </View>

        <View style={[styles.cellWidth, styles.centerAlign]}>
          <View style={styles.subjectRow}>
            <Text style={styles.boldText}>Subject -</Text>
            <Text style={styles.normalText}>
              {data.studentData[0].course_name_with_course_assignment_code}
            </Text>
          </View>
        </View>

        <View style={[styles.cellWidth, styles.rightAlign]}>
          <View style={styles.subjectRow}>
            <Text style={styles.boldText}>Faculty -</Text>
            <Text style={styles.normalText}>
              {data.studentData[0].employee_name}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const footer = (index) => (
    <View style={styles.footer}>
      <Text style={{ ...styles.boldText, textAlign: "center" }}>
        Page {index + 1} of {pages.length}
      </Text>
    </View>
  );
  return new Promise(async (resolve, reject) => {
    try {
      const generateDocument = (
        <Document title="Attendance Report">
          {pages.map((obj, i) => (
            <Page
              key={i}
              size="A3"
              orientation="landscape"
              style={styles.pageLayout}
            >
              {headings()}
              {isDetailed ? (
                <AttendanceReport pageData={obj} />
              ) : (
                <SummaryReport pageData={obj} />
              )}

              {footer(i)}
            </Page>
          ))}
        </Document>
      );
      const blob = await pdf(generateDocument).toBlob();
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
};
